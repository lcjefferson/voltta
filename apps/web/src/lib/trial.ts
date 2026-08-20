export function isTrialExpired(
  status: string | undefined,
  trialEndsAt: string | Date | undefined,
  now = new Date(),
): boolean {
  if (status !== "TRIALING" || !trialEndsAt) return false;
  return new Date(trialEndsAt).getTime() < now.getTime();
}

export function isTrialLocked(
  status: string | undefined,
  trialEndsAt: string | Date | undefined,
  platformAdmin?: boolean,
  now = new Date(),
): boolean {
  if (platformAdmin) return false;
  return isTrialExpired(status, trialEndsAt, now);
}

export const TRIAL_EXPIRED_MESSAGE =
  "Trial encerrado. Assine para continuar.";
