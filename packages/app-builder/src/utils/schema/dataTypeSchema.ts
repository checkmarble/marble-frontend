import * as z from 'zod';

const protocolWhitelist = ['http:', 'https:'];
export const urlDataTypeSchema = z.string().refine((value) => {
  try {
    const url = new URL(value);
    return protocolWhitelist.includes(url.protocol);
  } catch {
    return false;
  }
});

export const dateTimeDataTypeSchema = z.string().datetime({ offset: true });

export const knownDataTypeSchema = z.union([
  urlDataTypeSchema.transform((value) => ({
    type: 'url' as const,
    value,
  })),
  dateTimeDataTypeSchema.transform((value) => ({
    type: 'datetime' as const,
    value,
  })),
  z.number().transform((value) => ({
    type: 'number' as const,
    value,
  })),
]);
