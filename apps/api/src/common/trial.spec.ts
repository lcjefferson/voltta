import {
  isTrialExpired,
  isTrialLocked,
  TRIAL_EXPIRED_MESSAGE,
} from './trial';

describe('trial lock', () => {
  const now = new Date('2026-08-20T12:00:00.000Z');

  it('locks expired trial for regular users', () => {
    expect(
      isTrialExpired('TRIALING', new Date('2026-08-10T12:00:00.000Z'), now),
    ).toBe(true);
    expect(
      isTrialLocked(
        'TRIALING',
        new Date('2026-08-10T12:00:00.000Z'),
        false,
        now,
      ),
    ).toBe(true);
  });

  it('does not lock active billing or live trial', () => {
    expect(
      isTrialLocked('ACTIVE', new Date('2026-08-10T12:00:00.000Z'), false, now),
    ).toBe(false);
    expect(
      isTrialLocked(
        'TRIALING',
        new Date('2026-08-25T12:00:00.000Z'),
        false,
        now,
      ),
    ).toBe(false);
  });

  it('never locks platform admins', () => {
    expect(
      isTrialLocked(
        'TRIALING',
        new Date('2026-08-10T12:00:00.000Z'),
        true,
        now,
      ),
    ).toBe(false);
    expect(TRIAL_EXPIRED_MESSAGE).toMatch(/Assine/);
  });
});
