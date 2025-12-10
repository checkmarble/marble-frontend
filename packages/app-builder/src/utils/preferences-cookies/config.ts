import { z } from 'zod/v4';

export const COOKIE_NAME = 'u-prefs';

export type PreferencesCookie = {
  menuExpd: boolean;
  favInbox?: string;
};
export const PreferencesCookieSchema = z.object({
  menuExpd: z.preprocess((val) => val === 1, z.boolean()),
  favInbox: z.string().optional(),
});
