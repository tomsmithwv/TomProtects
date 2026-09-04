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
