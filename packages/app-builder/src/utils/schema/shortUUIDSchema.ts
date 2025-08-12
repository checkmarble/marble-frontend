import * as z from 'zod/v4';

import { fromSUUIDtoUUID } from '../short-uuid';

export interface RawUUIDIssue {
  code: 'custom';
  params: {
    expected: 'short-uuid';
    received: 'uuid' | 'string';
    value: string;
  };
  input?: unknown;
  path?: (string | number)[];
  message?: string;
}
export function isRawUUIDIssue(issue: unknown): issue is RawUUIDIssue {
  if (!issue || typeof issue !== 'object') return false;
  const anyIssue = issue as any;
  return (
    anyIssue.code === 'custom' &&
    anyIssue.params?.['expected'] === 'short-uuid' &&
    anyIssue.params?.['received'] === 'uuid'
  );
}

export const shortUUIDSchema = z.string().transform((value, ctx) => {
  try {
    return fromSUUIDtoUUID(value);
  } catch (_e) {
    const parsedValue = z.string().uuid().safeParse(value);
    if (parsedValue.success) {
      ctx.issues.push({
        code: 'custom',
        params: {
          expected: 'short-uuid',
          received: 'uuid',
          value: parsedValue.data,
        },
        input: value,
      } as any);
      return z.NEVER;
    }

    ctx.issues.push({
      code: 'custom',
      params: { expected: 'short-uuid', received: 'string', value },
      input: value,
    } as any);
    return z.NEVER;
  }
});
