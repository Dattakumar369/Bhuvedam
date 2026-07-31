const IST = 'Asia/Kolkata';

export interface LiveClock {
  dateLabel: string;
  timeLabel: string;
  isoLocal: string;
  timezone: string;
}

/** Exact device clock in IST — injected into AI context for "ippudu time entha" etc. */
export function formatLiveClock(now = new Date()): LiveClock {
  const dateLabel = now.toLocaleDateString('en-IN', {
    timeZone: IST,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeLabel = now.toLocaleTimeString('en-IN', {
    timeZone: IST,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '00';

  const isoLocal = `${pick('year')}-${pick('month')}-${pick('day')}T${pick('hour')}:${pick('minute')}:${pick('second')}+05:30`;

  return {
    dateLabel,
    timeLabel,
    isoLocal,
    timezone: 'IST (Asia/Kolkata)',
  };
}

export function formatLiveClockBlock(now = new Date()): string {
  const clock = formatLiveClock(now);
  return [
    `Date: ${clock.dateLabel}`,
    `Time now: ${clock.timeLabel}`,
    `ISO: ${clock.isoLocal}`,
    `Timezone: ${clock.timezone}`,
  ].join('\n');
}
