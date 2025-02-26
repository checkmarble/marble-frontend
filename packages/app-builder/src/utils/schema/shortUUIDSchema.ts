import * as z from 'zod';

import { toUUID } from '../short-uuid';

export interface RawUUIDIssue extends z.ZodCustomIssue {
  params: {
    expected: 'short-uuid';
    received: 'uuid';
    value: string;
  };
}
export function isRawUUIDIssue(issue: z.ZodIssueOptionalMessage): issue is RawUUIDIssue {
  return (
    issue.code === z.ZodIssueCode.custom &&
    issue.params?.['expected'] === 'short-uuid' &&
    issue.params?.['received'] === 'uuid'
  );
}

export const shortUUIDSchema = z.string().transform((value, ctx) => {
  try {
    return toUUID(value);
  } catch (e) {
    const parsedValue = z.string().uuid().safeParse(value);
    if (parsedValue.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        params: {
          expected: 'short-uuid',
          received: 'uuid',
          value: parsedValue.data,
        },
      } as Pick<RawUUIDIssue, 'code' | 'params'>);
      return z.NEVER;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      params: { expected: 'short-uuid', received: 'string', value },
    });
    return z.NEVER;
  }
});
