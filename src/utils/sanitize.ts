import sanitizeHtml from 'sanitize-html';

/**
 * Cleans the HTML Kit returns for a broadcast before it is rendered.
 *
 * Two jobs. The first is safety: nothing arrives on the page that could run
 * script or phone home. The second is consistency: Kit's editor emits inline
 * styles, font tags, and its own class names, and all of that is stripped so
 * posts inherit this site's typography rather than fighting it.
 *
 * This replaces an earlier regex-based cleaner. Regexes cannot parse HTML, so
 * that version could only match the shapes it had been told to expect — and it
 * carried a note saying it had never been checked against a real broadcast.
 * An allowlist inverts the risk: anything not named here is dropped, so an
 * unexpected tag fails closed rather than passing through.
 *
 * Runs at request time on the Workers runtime, not at build time, so anything
 * added here has to work there too.
 */
const options: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'hr',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'a',
    'ul',
    'ol',
    'li',
    'blockquote',
    'h2',
    'h3',
    'h4',
    'code',
    'pre',
    'figure',
    'figcaption',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ],

  allowedAttributes: {
    // target and rel are set by the transform below, and must be allowed here
    // or they are filtered straight back out again.
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
  },

  // No javascript: or data: URLs anywhere.
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesAppliedToAttributes: ['href', 'src'],

  // Drop the contents of these outright, rather than leaving stray text behind.
  nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript'],

  transformTags: {
    // A post's own title is the h1 on the page, so demote anything Kit sent as
    // one and keep the heading outline valid.
    h1: 'h2',

    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        // Kit posts link out often. Anything leaving the site opens safely.
        ...(attribs.href?.startsWith('http')
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {}),
      },
    }),

    // Images arrive at full size from Kit's CDN and should not block rendering.
    // Transforms run before scheme filtering, so the src is checked here rather
    // than trusted: an img whose src is about to be rejected is left bare
    // instead of being decorated with attributes it will never use.
    img: (tagName, attribs) => {
      const src = attribs.src ?? '';
      const willSurvive = /^https?:\/\//i.test(src) || src.startsWith('/');

      return {
        tagName,
        attribs: willSurvive ? { ...attribs, loading: 'lazy' } : attribs,
      };
    },
  },

  /**
   * Email-only artifacts.
   *
   * The allowlist above is about safety and consistency; it has no opinion on
   * whether an element belongs on a web page rather than in an inbox. These
   * two do not, and both would otherwise survive:
   *
   *   - Tracking beacons. A 1x1 image from the mail provider is how an email
   *     records an open. On the blog it would fire for every reader, which the
   *     privacy policy says the site does not do.
   *   - Unsubscribe and preference links. They belong to the email, and on the
   *     web they lead a reader out of a page they never subscribed from.
   *
   * exclusiveFilter drops the element and its contents, which is what is wanted
   * for both. Returning false keeps everything else.
   */
  exclusiveFilter: (frame) => {
    if (frame.tag === 'img') {
      const { width, height, src } = frame.attribs;
      if (width === '1' || height === '1') return true;
      // A src on a rejected scheme (data:, javascript:) is filtered out above,
      // which would otherwise leave a bare <img> that can never render.
      if (!src) return true;
    }

    if (frame.tag === 'a') {
      const href = (frame.attribs.href ?? '').toLowerCase();
      return /unsubscribe|email[_-]?preferences|\/preferences|opt[-_]?out|update[-_]?your[-_]?profile/.test(
        href,
      );
    }

    return false;
  },
};

export function sanitizePostHtml(html: string): string {
  if (!html) return '';

  // Dropping a footer link can leave the paragraph that held it behind, empty,
  // where it renders as an unexplained gap. This regex runs on our own output
  // rather than on Kit's input: by this point the markup is parsed, allowlisted
  // and attribute-free, so `<p>` is exactly that and matching it is safe.
  return sanitizeHtml(html, options)
    .replace(/<p>(?:\s|&nbsp;)*<\/p>/g, '')
    .trim();
}

/**
 * Strips a post down to plain text, for excerpts and meta descriptions.
 */
export function htmlToText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * A short, whole-word summary. Falls back to the empty string when there is
 * nothing to summarise, so callers can decide what to show.
 */
export function excerptFrom(html: string, maxLength = 200): string {
  const text = htmlToText(html);
  if (text.length <= maxLength) return text;

  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(' ');

  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}…`;
}
