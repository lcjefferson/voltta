import {
  billingLabel,
  isPlatformAdminEmail,
  parsePlatformAdminEmails,
  trialDaysLeft,
} from './platform-admin';

describe('platform admin helpers', () => {
  it('parses allowlist emails', () => {
    expect(
      parsePlatformAdminEmails('A@x.com, b@x.com; c@x.com  d@x.com'),
    ).toEqual(['a@x.com', 'b@x.com', 'c@x.com', 'd@x.com']);
    expect(parsePlatformAdminEmails('')).toEqual([]);
  });

  it('matches allowlist case-insensitively and denies empty list', () => {
    expect(isPlatformAdminEmail('A@x.com', ['a@x.com'])).toBe(true);
    expect(isPlatformAdminEmail('other@x.com', ['a@x.com'])).toBe(false);
    expect(isPlatformAdminEmail('a@x.com', [])).toBe(false);
  });

  it('computes trial remaining and expired labels', () => {
    const now = new Date('2026-08-17T12:00:00.000Z');
    expect(
      trialDaysLeft(new Date('2026-08-20T12:00:00.000Z'), now),
    ).toBe(3);
    expect(
      billingLabel('TRIALING', new Date('2026-08-10T12:00:00.000Z'), now),
    ).toBe('Trial expirado');
    expect(
      billingLabel('TRIALING', new Date('2026-08-20T12:00:00.000Z'), now),
    ).toBe('Trial (3d)');
    expect(
      billingLabel('ACTIVE', new Date('2026-08-20T12:00:00.000Z'), now),
    ).toBe('Em dia');
  });
});
