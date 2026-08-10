export type DayHours = { open: string; close: string } | null;

export type BusinessHours = {
  slotIntervalMinutes: number;
  days: Record<string, DayHours>;
};

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  slotIntervalMinutes: 30,
  days: {
    '0': null, // domingo
    '1': { open: '09:00', close: '19:00' },
    '2': { open: '09:00', close: '19:00' },
    '3': { open: '09:00', close: '19:00' },
    '4': { open: '09:00', close: '19:00' },
    '5': { open: '09:00', close: '19:00' },
    '6': { open: '09:00', close: '18:00' }, // sábado
  },
};

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function normalizeBusinessHours(raw: unknown): BusinessHours {
  const base: BusinessHours = {
    slotIntervalMinutes: DEFAULT_BUSINESS_HOURS.slotIntervalMinutes,
    days: { ...DEFAULT_BUSINESS_HOURS.days },
  };
  if (!raw || typeof raw !== 'object') return base;

  const input = raw as Partial<BusinessHours>;
  const interval = Number(input.slotIntervalMinutes);
  if (Number.isFinite(interval) && interval >= 5 && interval <= 120) {
    base.slotIntervalMinutes = Math.round(interval);
  }

  if (input.days && typeof input.days === 'object') {
    for (let d = 0; d <= 6; d++) {
      const key = String(d);
      const value = (input.days as Record<string, DayHours>)[key];
      if (value === null) {
        base.days[key] = null;
        continue;
      }
      if (
        value &&
        typeof value.open === 'string' &&
        typeof value.close === 'string' &&
        TIME_RE.test(value.open) &&
        TIME_RE.test(value.close) &&
        toMinutes(value.open) < toMinutes(value.close)
      ) {
        base.days[key] = { open: value.open, close: value.close };
      }
    }
  }

  return base;
}

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Offset fixo America/Sao_Paulo (sem horário de verão no Brasil). */
export function saoPauloOffset() {
  return '-03:00';
}

export function wallClockToDate(date: string, hhmm: string) {
  return new Date(`${date}T${hhmm}:00${saoPauloOffset()}`);
}

export function weekdayInSaoPaulo(date: string) {
  // Use noon UTC-ish local to avoid DST edge; construct with offset
  const d = wallClockToDate(date, '12:00');
  return d.getUTCDay(); // with -03, getUTCDay matches local weekday for noon
}

export function listOpenDates(
  hours: BusinessHours,
  fromDate: Date,
  daysAhead = 21,
): string[] {
  const out: string[] = [];
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(fromDate.getTime() + i * 86400000);
    const yyyy = d.toLocaleDateString('en-CA', {
      timeZone: 'America/Sao_Paulo',
    });
    const weekday = weekdayInSaoPaulo(yyyy);
    if (hours.days[String(weekday)]) out.push(yyyy);
  }
  return out;
}

export function buildSlots(params: {
  date: string;
  hours: BusinessHours;
  durationMinutes: number;
  busy: { startsAt: Date; endsAt: Date }[];
  now?: Date;
}) {
  const { date, hours, durationMinutes, busy } = params;
  const now = params.now ?? new Date();
  const weekday = weekdayInSaoPaulo(date);
  const day = hours.days[String(weekday)];
  if (!day) return [] as { startsAt: string; label: string }[];

  const open = toMinutes(day.open);
  const close = toMinutes(day.close);
  const step = hours.slotIntervalMinutes;
  const slots: { startsAt: string; label: string }[] = [];

  for (let t = open; t + durationMinutes <= close; t += step) {
    const label = fromMinutes(t);
    const startsAt = wallClockToDate(date, label);
    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60000);
    if (startsAt.getTime() <= now.getTime()) continue;
    const conflict = busy.some(
      (b) => startsAt < b.endsAt && endsAt > b.startsAt,
    );
    if (conflict) continue;
    slots.push({ startsAt: startsAt.toISOString(), label });
  }

  return slots;
}
