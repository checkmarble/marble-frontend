import { z } from 'zod/v4';

type ZArrayValue<T> = T extends z.ZodArray<z.ZodType<infer U>> ? U : never;

export function uniqueStringArray<T extends z.ZodArray<z.ZodType<any>>>(
  schema: T,
  keyOf: (item: ZArrayValue<T>) => unknown,
): T {
  return schema.superRefine((array, ctx) => {
    if (array.length !== new Set(array).size) {
      ctx.addIssue({
        code: 'custom',
        params: {
          code: 'duplicate_value_in_array',
        },
        input: array,
      });
    }
  });
}
