import { isISO8601 } from 'class-validator';

const canonicalDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const isoDate = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-]\d{2}(?::?\d{2})?)?)?$/;
const noaaDate = /^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?$/;
const utcDate = /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} GMT$/;

/** Normalize supported mobile/NOAA date formats without relying on the server timezone. */
export function normalizeSolarWindDate(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;

  if (utcDate.test(value)) {
    const parsed = new Date(value);
    // Validate calendar date and weekday; Date.parse can otherwise normalize them.
    return Number.isFinite(parsed.getTime()) && parsed.toUTCString() === value ? parsed.toISOString() : undefined;
  }

  const noaa = noaaDate.exec(value);
  const source = noaa ? `${noaa[1]}T${noaa[2]}:${noaa[3]}:${noaa[4]}${noaa[5] ? `.${noaa[5]}` : ''}Z` : value;
  const iso = isoDate.exec(source);
  if (!iso || !isISO8601(source, { strict: true, strictSeparator: true })) return undefined;
  const [, day, hour = '00', minute = '00', second = '00', fraction = '', offset = 'Z'] = iso;
  if (+hour > 23 || +minute > 59 || +second > 59) return undefined;
  const zone = /^[+-]\d{2}$/.test(offset) ? `${offset}:00` : offset;
  const parsed = new Date(`${day}T${hour}:${minute}:${second}.${fraction.padEnd(3, '0').slice(0, 3)}${zone}`);
  if (!Number.isFinite(parsed.getTime())) return undefined;
  const result = parsed.toISOString();
  return canonicalDate.test(result) ? result : undefined;
}
