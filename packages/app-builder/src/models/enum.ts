import { z } from 'zod/v4';

export const enumColors = [
  'var(--color-enum-teal)',
  'var(--color-enum-green)',
  'var(--color-enum-lime)',
  'var(--color-enum-yellow)',
  'var(--color-enum-orange)',
  'var(--color-enum-red)',
  'var(--color-enum-pink)',
  'var(--color-enum-magenta)',
  'var(--color-enum-purple)',
  'var(--color-enum-blue)',
  'var(--color-enum-sky)',
  'var(--color-enum-grey)',
] as const;

export type EnumColors = (typeof enumColors)[number];
export const enumEntrySchema = z.object({
  key: z.string().refine((value) => value.trim().length > 0),
  color: z.enum(enumColors),
});
export type EnumEntry = z.infer<typeof enumEntrySchema>;
export const enumEntriesSchema = z
  .array(enumEntrySchema)
  .min(1)
  .refine((entries) => new Set(entries.map((entry) => entry.key)).size === entries.length);
export const countryCodeFormatSchema = z.enum(['alpha2', 'alpha3']);
export type CountryCodeFormat = z.infer<typeof countryCodeFormatSchema>;
export const currencyCodeFormatSchema = z.enum(['ISO 4217', 'Number']);
export type CurrencyCodeFormat = z.infer<typeof currencyCodeFormatSchema>;
export function createEnumEntry(): EnumEntry {
  return { key: '', color: enumColors[0] };
}
