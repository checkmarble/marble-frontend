import { z } from 'zod';

export const COOKIE_NAME = 'u-prefs';

export type PreferencesCookie = {
  menuExpd: boolean;
};
export const PreferencesCookieSchema = z.object({
  menuExpd: z.preprocess(
    (val) => val === 'true' || val === true || val === '1' || val === 1 || val === 1n,
    z.boolean(),
  ),
});
