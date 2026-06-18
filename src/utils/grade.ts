import { CheckStatus, Grade } from './types';

interface GradeInput {
  spf: CheckStatus;
  dkim: CheckStatus;
  dmarc: CheckStatus;
  isFreemail?: boolean;
}

export function calculateGrade(input: GradeInput): Grade {
  const { spf, dkim, dmarc, isFreemail } = input;

  if (isFreemail) {
    return 'F'; // Freemail senders should use their own domain
  }

  const isSPFCritical = spf === 'fail' || spf === 'error';
  const isDMARCCritical = dmarc === 'fail' || dmarc === 'error';
  const isSPFWarning = spf === 'warn';
  const isDMARCWarning = dmarc === 'warn';

  // Both SPF and DMARC are critical. Missing either is a major problem.
  // A: SPF pass, DMARC pass (DKIM status doesn't matter much)
  if (!isSPFCritical && !isDMARCCritical && !isSPFWarning && !isDMARCWarning) {
    return 'A';
  }

  // B: Both pass but one has a warning, OR both pass and DKIM has issues
  if (!isSPFCritical && !isDMARCCritical && (isSPFWarning || isDMARCWarning || dkim === 'fail')) {
    return 'B';
  }

  // C: One critical (SPF or DMARC) fails
  if (isSPFCritical || isDMARCCritical) {
    if (isSPFCritical && !isDMARCCritical) return 'C';
    if (isDMARCCritical && !isSPFCritical) return 'C';
  }

  // D: Both SPF and DMARC fail/error
  if (isSPFCritical && isDMARCCritical) {
    return 'D';
  }

  return 'F';
}
