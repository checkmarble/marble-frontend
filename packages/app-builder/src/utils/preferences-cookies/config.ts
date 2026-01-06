import { z } from 'zod/v4';

export const COOKIE_NAME = 'u-prefs';

/**
 * Validates that a string is a valid IANA timezone identifier.
 * Uses Intl.DateTimeFormat to test if the timezone is recognized.
 */
function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

const timezoneSchema = z.string().refine(isValidTimezone, { message: 'Invalid IANA timezone identifier' });

const themeSchema = z.enum(['light', 'dark']);
export type Theme = z.infer<typeof themeSchema>;

export type PreferencesCookie = {
  menuExpd: boolean;
  favInbox?: string;
  timezone?: string;
  theme?: Theme;
};
export const PreferencesCookieSchema = z.object({
  menuExpd: z.preprocess((val) => val === 1, z.boolean()),
  favInbox: z.string().optional(),
  timezone: timezoneSchema.optional(),
  theme: themeSchema.optional(),
});
