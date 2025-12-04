import { z } from 'zod/v4';

export const COOKIE_NAME = 'u-prefs';

export type PreferencesCookie = {
  menuExpd: boolean;
};
export const PreferencesCookieSchema = z.object({
  menuExpd: z.preprocess((val) => val === 1, z.boolean()),
});
