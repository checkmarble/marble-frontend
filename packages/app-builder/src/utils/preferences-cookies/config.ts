import { z } from 'zod/v4';

export const COOKIE_NAME = 'u-prefs';

export type PreferencesCookie = {
  menuExpd: boolean;
  versionSnoozeExpiry?: number;
  versionSnoozedVersion?: string;
};
export const PreferencesCookieSchema = z.object({
  menuExpd: z.preprocess((val) => val === 1, z.boolean()),
  versionSnoozeExpiry: z.number().optional(),
  versionSnoozedVersion: z.string().optional(),
});
