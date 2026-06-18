const FREE_MAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'ymail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'gmx.com',
  'zoho.com',
  'mail.com',
  'yandex.com',
]);

// Simple email regex validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): { valid: boolean; domain?: string; error?: string } {
  const trimmed = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }

  const [, domain] = trimmed.split('@');

  if (!domain) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true, domain };
}

export function isFreemailDomain(domain: string): boolean {
  return FREE_MAIL_DOMAINS.has(domain.toLowerCase());
}
