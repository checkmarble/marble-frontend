import * as z from 'zod';

const protocolWhitelist = ['http:', 'https:'];
const urlDataTypeSchema = z
  .string()
  .refine((value) => {
    try {
      const url = new URL(value);
      return protocolWhitelist.includes(url.protocol);
    } catch {
      return false;
    }
  })
  .transform((value) => ({
    type: 'url' as const,
    value,
  }));

const dateTimeDataTypeSchema = z
  .string()
  .datetime({ offset: true })
  .transform((value) => ({
    type: 'datetime' as const,
    value,
  }));

const numberDataTypeSchema = z.number().transform((value) => ({
  type: 'number' as const,
  value,
}));

export const knownDataTypeSchema = z.union([
  urlDataTypeSchema,
  dateTimeDataTypeSchema,
  numberDataTypeSchema,
]);
