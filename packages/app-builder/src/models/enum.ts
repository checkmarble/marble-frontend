import { z } from 'zod/v4';

export const enumColors = [
  'green',
  'orange',
  'red',
  'blue',
  'yellow',
  'purple',
  'pink',
  'brown',
  'gray',
  'black',
  'white',
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

export function createEnumEntry(): EnumEntry {
  return { key: '', color: 'gray' };
}
