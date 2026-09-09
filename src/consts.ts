/**
 * Site-wide facts, kept in one place so pages never restate them.
 *
 * The contact address in particular was written out in five places across four
 * files, which is how a changed address ends up half-changed.
 */
export const SITE = {
  name: 'TomProtects',
  url: 'https://tomprotects.com',
  positioning: 'Fractional CISO & Security Advisor',
  email: 'hello@tomprotects.com',
} as const;
