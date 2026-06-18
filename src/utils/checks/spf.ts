import { queryDNS } from '../dns';
import { SPFCheck } from '../types';

const SPF_PREFIX = 'v=spf1';
const SPF_MECHANISMS = /\b(include|a|mx|ptr|exists|redirect|exp)/g;

export async function checkSPF(domain: string): Promise<SPFCheck> {
  try {
    const records = await queryDNS(domain, 'TXT');

    const spfRecords = records
      .filter((r) => r.data && r.data.includes(SPF_PREFIX))
      .map((r) => r.data);

    // No SPF record
    if (spfRecords.length === 0) {
      return {
        status: 'fail',
        record: undefined,
        details: 'No SPF record found. Emails from your domain are at high risk of being marked as spam.',
      };
    }

    // Multiple SPF records (RFC violation)
    if (spfRecords.length > 1) {
      return {
        status: 'error',
        record: spfRecords,
        details: `RFC violation: multiple SPF records found (${spfRecords.length}). This causes permerror and breaks authentication.`,
      };
    }

    const spfRecord = spfRecords[0];

    // Count mechanisms
    const mechanisms = (spfRecord.match(SPF_MECHANISMS) || []).length;

    // Check for issues
    const hasPermError = mechanisms > 10;
    const allowsAll = spfRecord.includes('+all');
    const weakAll = spfRecord.includes('?all');
    const endsWithAll = spfRecord.endsWith('+all') || spfRecord.endsWith('~all') || spfRecord.endsWith('-all') || spfRecord.endsWith('?all');

    // Warnings
    if (allowsAll) {
      return {
        status: 'warn',
        record: spfRecord,
        mechanisms,
        hasPermError,
        details: 'SPF record ends with +all, which allows anyone to send emails on your behalf. Change to ~all or -all.',
      };
    }

    if (weakAll) {
      return {
        status: 'warn',
        record: spfRecord,
        mechanisms,
        hasPermError,
        details: 'SPF record ends with ?all (neutral). Consider using ~all (soft fail) or -all (hard fail) for better protection.',
      };
    }

    if (hasPermError) {
      return {
        status: 'warn',
        record: spfRecord,
        mechanisms,
        hasPermError: true,
        details: `Too many DNS lookup mechanisms (${mechanisms} > 10). You may hit the DNS lookup limit (permerror).`,
      };
    }

    if (!endsWithAll) {
      return {
        status: 'warn',
        record: spfRecord,
        mechanisms,
        hasPermError,
        details: 'SPF record does not end with -all or ~all. Add one for better email authentication.',
      };
    }

    // Pass
    return {
      status: 'pass',
      record: spfRecord,
      mechanisms,
      hasPermError: false,
      details: 'SPF record is properly configured.',
    };
  } catch (error) {
    console.error('SPF check error:', error);
    return {
      status: 'error',
      details: 'Could not check SPF record. Please try again.',
    };
  }
}
