import { knownDataTypeSchema } from './schema/dataTypeSchema';

export function parseUnknownData(value: unknown) {
  const parseResult = knownDataTypeSchema.safeParse(value);
  if (parseResult.success) {
    return parseResult.data;
  }
  return { type: 'unknown' as const, value };
}
