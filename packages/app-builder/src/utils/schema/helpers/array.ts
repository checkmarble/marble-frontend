import { z } from 'zod/v4';

type ProtectArrayOptions = {
  maxLength?: number;
};

export function protectArray<T extends z.ZodArray<z.ZodType<any>>>(schema: T, options?: ProtectArrayOptions) {
  const maxLength = options?.maxLength ?? 1000;

  return z
    .any()
    .refine((value) => Array.isArray(value) && value.length <= maxLength, { message: 'ARRAY_MAX_LENGTH' })
    .pipe(schema);
}
