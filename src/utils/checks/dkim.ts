import { queryDNS } from '../dns';
import { DKIMCheck } from '../types';

// Best-effort selector probing. DKIM selectors are arbitrary, so absence at these
// common locations is NOT proof of misconfiguration — language stays honest.
const COMMON_SELECTORS = [
  'google', // Google Workspace
  'selector1', // Microsoft 365
  'selector2',
  'k1', // Kit/Mailchimp/Mandrill
  'k2',
  'k3',
  's1', // SendGrid
  's2',
  'ctct1', // Constant Contact
  'ctct2',
  'mail', // Generic
  'default',
  'dkim',
  'everlytickey1', // Everlytic
  'everlytickey2',
  'mx', // Zoho
  'zmail',
];

export async function checkDKIM(domain: string): Promise<DKIMCheck> {
  try {
    // Probe selectors in parallel
    const probePromises = COMMON_SELECTORS.map(async (selector) => {
      const dkimDomain = `${selector}._domainkey.${domain}`;
      const records = await queryDNS(dkimDomain, 'TXT');
      const found = records.some((r) => r.data && r.data.includes('v=DKIM1'));
      return found ? selector : null;
    });

    const results = await Promise.all(probePromises);
    const foundSelectors = results.filter((s) => s !== null);

    // DKIM records found
    if (foundSelectors.length > 0) {
      return {
        status: 'pass',
        found: foundSelectors as string[],
        details: `DKIM records found at selector(s): ${foundSelectors.join(', ')}`,
      };
    }

    // Not found at common locations
    return {
      status: 'not-found',
      found: [],
      details: `We couldn't find DKIM at common selector locations (${COMMON_SELECTORS.length} checked). This doesn't necessarily mean it's missing — but if you haven't set it up, it probably is.`,
    };
  } catch (error) {
    console.error('DKIM check error:', error);
    return {
      status: 'error',
      details: 'Could not check DKIM records. Please try again.',
    };
  }
}
