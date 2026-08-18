export const TENANT_BUCKETS = [
  'trialing',
  'trial_expired',
  'expiring_soon',
  'active',
  'past_due',
  'canceled',
  'suspended',
] as const;

export type TenantBucket = (typeof TENANT_BUCKETS)[number];

export function parsePlatformAdminEmails(raw?: string | null): string[] {
  return (raw || '')
    .split(/[,;\s]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isPlatformAdminEmail(
  email: string | undefined,
  allowlist: string[],
): boolean {
  if (!email || allowlist.length === 0) return false;
  return allowlist.includes(email.trim().toLowerCase());
}

export function trialDaysLeft(trialEndsAt: Date, now = new Date()): number {
  return Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86400000);
}

export function billingLabel(
  status: string,
  trialEndsAt: Date,
  now = new Date(),
): string {
  if (status === 'TRIALING') {
    const days = trialDaysLeft(trialEndsAt, now);
    if (days < 0) return 'Trial expirado';
    if (days === 0) return 'Trial acaba hoje';
    return `Trial (${days}d)`;
  }
  const labels: Record<string, string> = {
    TRIALING: 'Trial',
    ACTIVE: 'Em dia',
    PAST_DUE: 'Inadimplente',
    CANCELED: 'Cancelado',
    SUSPENDED: 'Suspenso',
  };
  return labels[status] || status;
}
