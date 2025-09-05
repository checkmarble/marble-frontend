import { z } from 'zod/v4';

type ZArrayValue<T> = T extends z.ZodArray<z.ZodType<infer U>> ? U : never;

export function uniqueBy<T extends z.ZodArray<z.ZodType<any>>>(
  schema: T,
  keyOf: (item: ZArrayValue<T>) => unknown,
): T {
  return schema.superRefine((array, ctx) => {
    const firstIndexByKey = new Map<unknown, number>();

    array.forEach((item, index) => {
      const key = keyOf(item);
      // Add issue if the key has already been seen
      if (firstIndexByKey.has(key)) {
        ctx.addIssue({
          code: 'custom',
          path: [index],
          params: {
            code: 'duplicate_value',
          },
        });
      } else {
        firstIndexByKey.set(key, index);
      }
    });
  });
}
