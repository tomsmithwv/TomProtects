import { SPFCheck, DKIMCheck, DMARCCheck } from './types';

export function generateRecommendations(
  spf: SPFCheck,
  dkim: DKIMCheck,
  dmarc: DMARCCheck,
): string[] {
  const recommendations: string[] = [];

  // SPF recommendations (highest impact)
  if (spf.status === 'fail') {
    recommendations.push(
      '🔴 Add an SPF record to your domain. This tells email providers which servers are authorized to send emails on your behalf. Without it, spammers can impersonate you.',
    );
  } else if (spf.status === 'warn' && (spf.record as string)?.includes('+all')) {
    recommendations.push(
      '⚠️  Your SPF record allows anyone to send emails on your behalf (+all). Change it to ~all (soft fail) or -all (hard fail) to prevent abuse.',
    );
  } else if (spf.status === 'warn' && (spf.hasPermError || (spf.mechanisms || 0) > 10)) {
    recommendations.push(
      '⚠️  Your SPF record has too many DNS lookups. Consolidate your email providers or use SPF macros to reduce complexity.',
    );
  }

  // DMARC recommendations
  if (dmarc.status === 'fail') {
    recommendations.push(
      '🔴 Add a DMARC record. This prevents others from spoofing your domain and tells providers how to handle emails that fail authentication checks.',
    );
  } else if (dmarc.status === 'warn' && dmarc.policy === 'none') {
    recommendations.push(
      '⚠️  Your DMARC is in monitoring mode (p=none). Once SPF and DKIM are set up, upgrade to quarantine or reject to block imposters.',
    );
  } else if (dmarc.status === 'warn' && !dmarc.hasReporting) {
    recommendations.push(
      '⚠️  Your DMARC record is missing reporting (rua=). Add this so you can see if anyone is trying to spoof your domain.',
    );
  }

  // DKIM recommendations (lowest impact, optional for small senders)
  if (dkim.status === 'not-found' && spf.status !== 'fail') {
    recommendations.push(
      'Optional: Set up DKIM for extra protection. It cryptographically signs your emails, making them nearly impossible to forge. Ask your email provider for setup instructions.',
    );
  }

  // If all pass
  if (
    spf.status === 'pass' &&
    dmarc.status === 'pass' &&
    (dkim.status === 'pass' || dkim.status === 'not-found')
  ) {
    recommendations.push(
      '✅ Your domain authentication is solid. Your emails are far more likely to land in the inbox. Monitor your DMARC reports for any suspicious activity.',
    );
  }

  // Return top 2-4, prioritizing higher impact
  return recommendations.slice(0, 4);
}
