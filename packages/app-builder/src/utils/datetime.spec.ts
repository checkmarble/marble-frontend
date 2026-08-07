import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import { getCalendarDayDistance, getDueDateUrgency } from './datetime';

describe('getCalendarDayDistance', () => {
  it('resolves calendar days in the given timezone when `now` is in another zone', () => {
    // 2026-08-05T22:30Z is already 2026-08-06 in Tokyo (UTC+9).
    const now = Temporal.ZonedDateTime.from('2026-08-05T22:30:00+00:00[UTC]');

    expect(getCalendarDayDistance('2026-08-06T00:30:00Z', { timeZone: 'Asia/Tokyo', now })).toEqual({ kind: 'today' });
    expect(getCalendarDayDistance('2026-08-05T22:30:00Z', { timeZone: 'UTC', now })).toEqual({ kind: 'today' });
  });

  it('counts days across a boundary consistently in the target timezone', () => {
    const now = Temporal.ZonedDateTime.from('2026-08-05T22:30:00+00:00[UTC]');

    // 2026-08-07T00:30Z is 2026-08-07 09:30 in Tokyo, one day after Tokyo's "today".
    expect(getCalendarDayDistance('2026-08-07T00:30:00Z', { timeZone: 'Asia/Tokyo', now })).toEqual({
      kind: 'tomorrow',
    });
    expect(getCalendarDayDistance('2026-08-05T10:00:00Z', { timeZone: 'Asia/Tokyo', now })).toEqual({
      kind: 'yesterday',
    });
  });

  it('returns null for unset or invalid timestamps', () => {
    expect(getCalendarDayDistance(null)).toBeNull();
    expect(getCalendarDayDistance('0001-01-01T00:00:00Z')).toBeNull();
    expect(getCalendarDayDistance('not-a-date')).toBeNull();
  });
});

describe('getDueDateUrgency', () => {
  it('uses the target timezone calendar day for urgency', () => {
    const now = Temporal.ZonedDateTime.from('2026-08-05T22:30:00+00:00[UTC]');

    // Due 2026-08-06 09:30 Tokyo, which is Tokyo's "today" → 0 days left.
    expect(getDueDateUrgency('2026-08-06T00:30:00Z', { timeZone: 'Asia/Tokyo', now })).toEqual({
      kind: 'left',
      days: 0,
    });
    // Same instant in UTC is tomorrow → 1 day left.
    expect(getDueDateUrgency('2026-08-06T00:30:00Z', { timeZone: 'UTC', now })).toEqual({ kind: 'left', days: 1 });
  });

  it('reports overdue due dates as late', () => {
    const now = Temporal.ZonedDateTime.from('2026-08-05T22:30:00+00:00[UTC]');

    expect(getDueDateUrgency('2026-08-04T10:00:00Z', { timeZone: 'Asia/Tokyo', now })).toEqual({
      kind: 'late',
      days: 2,
    });
  });

  it('returns null beyond the urgency window', () => {
    const now = Temporal.ZonedDateTime.from('2026-08-05T22:30:00+00:00[UTC]');

    expect(getDueDateUrgency('2026-08-12T10:00:00Z', { timeZone: 'UTC', now })).toBeNull();
  });
});
