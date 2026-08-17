/** Prefixo curto do link público de agendamento. */
export const BOOKING_PATH_PREFIX = "/b";

export function bookingPath(slug: string) {
  return `${BOOKING_PATH_PREFIX}/${slug}`;
}

export function bookingAbsoluteUrl(slug: string, origin?: string) {
  const path = bookingPath(slug);
  if (origin) return `${origin.replace(/\/$/, "")}${path}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  return path;
}
