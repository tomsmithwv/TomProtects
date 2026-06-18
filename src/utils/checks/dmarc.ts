import { queryDNS } from '../dns';
import { DMARCCheck } from '../types';

const DMARC_PREFIX = 'v=DMARC1';

export async function checkDMARC(domain: string): Promise<DMARCCheck> {
  try {
    const dmarcDomain = `_dmarc.${domain}`;
    const records = await queryDNS(dmarcDomain, 'TXT');

    const dmarcRecords = records
      .filter((r) => r.data && r.data.includes(DMARC_PREFIX))
      .map((r) => r.data);

    // No DMARC record
    if (dmarcRecords.length === 0) {
      return {
        status: 'fail',
        record: undefined,
        policy: 'none',
        hasReporting: false,
        details: 'No DMARC record found. You have no protection against domain spoofing.',
      };
    }

    const dmarcRecord = dmarcRecords[0];
    const policy = extractPolicy(dmarcRecord);
    const hasReporting = dmarcRecord.includes('rua=');

    const tips = modernizationTips(dmarcRecord);

    // Policy = none (monitoring only)
    if (policy === 'none') {
      return {
        status: 'warn',
        record: dmarcRecord,
        policy: 'none',
        hasReporting,
        details: 'DMARC policy is set to "none" (monitoring only). This is a good start, but offers no protection. Consider upgrading to quarantine or reject.',
        modernizationTips: tips,
      };
    }

    // Missing reporting
    if (!hasReporting) {
      return {
        status: 'warn',
        record: dmarcRecord,
        policy,
        hasReporting: false,
        details: 'DMARC record is missing rua (aggregate reporting). You cannot see if anyone is spoofing your domain.',
        modernizationTips: tips,
      };
    }

    // Policy = quarantine or reject with reporting
    if (policy === 'quarantine' || policy === 'reject') {
      return {
        status: 'pass',
        record: dmarcRecord,
        policy,
        hasReporting: true,
        details: `DMARC is properly configured with policy="${policy}" and reporting enabled.`,
        modernizationTips: tips,
      };
    }

    return {
      status: 'warn',
      record: dmarcRecord,
      policy,
      hasReporting,
      details: 'DMARC record found but policy is unclear. Review your configuration.',
      modernizationTips: tips,
    };
  } catch (error) {
    console.error('DMARC check error:', error);
    return {
      status: 'error',
      details: 'Could not check DMARC record. Please try again.',
    };
  }
}

function extractPolicy(dmarcRecord: string): string | undefined {
  const match = dmarcRecord.match(/p=(\w+)/);
  return match ? match[1] : undefined;
}

function modernizationTips(record: string): string[] {
  const tips: string[] = [];

  if (/\brf=/.test(record) || /\bri=/.test(record)) {
    tips.push(
      'Your record uses rf= or ri= tags, which were deprecated in RFC 9989 (May 2026). They still work fine, but you can safely remove them to tidy things up.',
    );
  }

  if (/\bpct=0\b/.test(record)) {
    tips.push(
      'pct=0 puts DMARC in testing mode, but the cleaner way under the updated spec is t=y. Either works — t=y just makes the intent more explicit.',
    );
  }

  if (!/\bnp=/.test(record)) {
    tips.push(
      'Consider adding np=quarantine to your record. It tells receivers what to do with mail from non-existent subdomains of your domain — a small but tidy improvement.',
    );
  }

  return tips;
}
