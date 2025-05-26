import { z } from 'zod';

export type PreferencesCookie = {
  menuExpanded: boolean;
};
export const PreferencesCookieSchema = z.object({
  menuExpanded: z.preprocess(
    (val) => val === 'true' || val === true || val === '1' || val === 1 || val === 1n,
    z.boolean(),
  ),
});
