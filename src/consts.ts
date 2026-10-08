/**
 * Site-wide facts, kept in one place so pages never restate them.
 *
 * The contact address in particular was written out in five places across four
 * files, which is how a changed address ends up half-changed.
 */
export const SITE = {
  name: 'TomProtects',
  url: 'https://tomprotects.com',
  // Plain language, not the job title. The people this is written for are not
  // searching for a CISO; "fractional CISO" is kept for /about, where it reads
  // as biography rather than as a word the reader has to decode first.
  positioning: 'Security for online businesses that run on trust',
  email: 'hello@tomprotects.com',
} as const;
