import { describe, expect, it } from 'vitest';
import { formatDateTimeWithoutPresets } from './format';

describe('formatDateTimeWithoutPresets', () => {
  const date = '2000-01-23T09:05:00Z';

  // Intl puts a narrow no-break space before AM.
  it('writes a short en-US year in full with fullYear, and keeps the rest of the format', () => {
    const short = { language: 'en-US', timeZone: 'UTC', dateStyle: 'short' } as const;
    expect(formatDateTimeWithoutPresets(date, short)).toBe('1/23/00');
    expect(formatDateTimeWithoutPresets(date, { ...short, fullYear: true })).toBe('1/23/2000');
    expect(formatDateTimeWithoutPresets(date, { ...short, timeStyle: 'short', fullYear: true })).toBe(
      '1/23/2000, 9:05\u202fAM',
    );
  });

  it.each([
    ['en-GB', '23/01/2000, 09:05'],
    ['fr-FR', '23/01/2000 09:05'],
  ])('leaves %s, whose short year has 4 digits, as it is', (language, expected) => {
    const options = { language, timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' } as const;
    expect(formatDateTimeWithoutPresets(date, { ...options, fullYear: true })).toBe(expected);
    expect(formatDateTimeWithoutPresets(date, options)).toBe(expected);
  });

  it('leaves a format without a year alone', () => {
    expect(
      formatDateTimeWithoutPresets(date, { language: 'en-US', timeZone: 'UTC', timeStyle: 'short', fullYear: true }),
    ).toBe('9:05\u202fAM');
  });
});
