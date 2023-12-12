import * as z from 'zod';

export const stringToJSONSchema = z.string().transform((str, ctx) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    ctx.addIssue({ code: 'custom', message: 'Invalid JSON' });
    return z.NEVER;
  }
});

export const stringToStringArray = stringToJSONSchema.pipe(z.array(z.string()));
