import * as z from 'zod/v4';

import { fromSUUIDtoUUID } from '../short-uuid';

export const shortUUIDSchema = z.string().transform((value, ctx) => {
  try {
    return fromSUUIDtoUUID(value);
  } catch {
    ctx.issues.push({ code: 'custom', message: 'Invalid short-uuid', input: value } as any);
    return z.NEVER;
  }
});
