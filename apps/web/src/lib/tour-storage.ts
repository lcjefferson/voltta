const tourDoneKey = (companyId: string) => `voltta_tour_done_${companyId}`;

export function isTourDoneLocally(companyId?: string) {
  if (typeof window === "undefined" || !companyId) return false;
  return localStorage.getItem(tourDoneKey(companyId)) === "1";
}

export function markTourDoneLocally(companyId?: string) {
  if (typeof window === "undefined" || !companyId) return;
  localStorage.setItem(tourDoneKey(companyId), "1");
}

export function clearTourDoneLocally(companyId?: string) {
  if (typeof window === "undefined" || !companyId) return;
  localStorage.removeItem(tourDoneKey(companyId));
}
