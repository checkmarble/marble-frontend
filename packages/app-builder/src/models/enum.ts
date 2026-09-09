import { z } from 'zod/v4';

export const enumColors = [
  '#88DCDE',
  '#46BB7F',
  '#8FA251',
  '#EEA200',
  '#FF8533',
  '#DB5F4A',
  '#CD719C',
  '#D06FF4',
  '#7F76F7',
  '#4D73E5',
  '#589FFF',
  '#838292',
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
