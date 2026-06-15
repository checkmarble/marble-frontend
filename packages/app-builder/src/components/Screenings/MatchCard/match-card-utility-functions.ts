import { FamilyPersonEntity, FamilyRelativeEntity } from '@app-builder/models/screening';
import { formatDateTimeWithoutPresets } from '@app-builder/utils/format';
import { tryCatch } from '@app-builder/utils/tryCatch';
import { Temporal } from 'temporal-polyfill';
import { match } from 'ts-pattern';
import { getCountryByName } from 'ui-design-system';
import { z } from 'zod';
import { AssociationRow } from './Associations';
import { FamilyMemberRow } from './FamilyDetail';

export type AddressEntity = {
  caption?: string;
  properties: {
    full?: string;
    street?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    notes?: string;
  };
};

const addressEntityUuidSchema = z.uuid();

const rawAddressEntitySchema = z.object({
  caption: z.string().optional(),
  schema: z.string().optional(),
  properties: z.object({
    full: z.array(z.string()).optional(),
    street: z.array(z.string()).optional(),
    city: z.array(z.string()).optional(),
    country: z.array(z.string()).optional(),
    postalCode: z.array(z.string()).optional(),
    notes: z.array(z.string()).optional(),
  }),
});

type RawAddressEntity = z.infer<typeof rawAddressEntitySchema>;

const POSTAL_CODE_PATTERN = /^\d[\dA-Za-z\s-]*$/;
const MAX_DISPLAY_PATH_SEGMENT_LENGTH = 20;
const EMBEDDED_ENGLISH_DATE_REGEX =
  /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/g;
const FULL_BIRTH_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const YEAR_ONLY_BIRTH_DATE_PATTERN = /^\d{4}$/;

const SCRIPT_DETECTORS: Array<{ name: string; test: RegExp }> = [
  { name: 'Arabic', test: /\p{Script=Arabic}/u },
  { name: 'Hangul Syllables', test: /\p{Script=Hangul}/u },
  { name: 'Cyrillic', test: /\p{Script=Cyrillic}/u },
  { name: 'Han', test: /\p{Script=Han}/u },
  { name: 'Hiragana', test: /\p{Script=Hiragana}/u },
  { name: 'Katakana', test: /\p{Script=Katakana}/u },
  { name: 'Hebrew', test: /\p{Script=Hebrew}/u },
  { name: 'Greek', test: /\p{Script=Greek}/u },
  { name: 'Devanagari', test: /\p{Script=Devanagari}/u },
  { name: 'Thai', test: /\p{Script=Thai}/u },
  { name: 'Armenian', test: /\p{Script=Armenian}/u },
  { name: 'Georgian', test: /\p{Script=Georgian}/u },
];

const LATIN_OR_NEUTRAL_CHAR =
  /\p{Script=Latin}|\p{General_Category=Punctuation}|\p{General_Category=Separator}|\p{General_Category=Number}/u;

export type TextSegment = { type: 'text'; value: string } | { type: 'date'; value: string };
export type BirthDateKind = 'full' | 'year';
export type BirthDateRange =
  | { type: 'years'; minYear: number; maxYear: number }
  | { type: 'same_year'; min: Temporal.PlainDate; max: Temporal.PlainDate; year: number }
  | { type: 'full'; min: Temporal.PlainDate; max: Temporal.PlainDate };

/**
 * Addresses
 */

function firstValue(values: string[] | undefined): string | undefined {
  return values?.[0];
}

function normalizeAddressKey(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function resolveCountryCode(country: string): string {
  if (country.length === 2) return country.toLowerCase();
  return getCountryByName(country)?.isoAlpha2 ?? country;
}

function joinStreetSegments(segments: string[]): string {
  if (segments.length === 0) return '';
  if (segments.length === 1) return segments[0]!;

  const [first, second, ...rest] = segments;
  if (/^\d+$/.test(first!)) {
    return [`${first}, ${second}`, ...rest].filter(Boolean).join(', ');
  }

  return segments.join(', ');
}

function trimLongTrailingPathSegments(pathname: string): string {
  const segments = pathname.split('/').filter((segment) => segment.length > 0);
  let lastRemoved: string | undefined;

  while (segments.length > 0 && (segments.at(-1)?.length ?? 0) > MAX_DISPLAY_PATH_SEGMENT_LENGTH) {
    lastRemoved = segments.pop();
  }

  if (!lastRemoved) {
    return segments.length > 0 ? `/${segments.join('/')}` : '/';
  }

  const base = segments.length > 0 ? `/${segments.join('/')}` : '';
  return `${base}/${segmentPreview(lastRemoved)}...`;
}

function segmentPreview(segment: string): string {
  const decoded = tryCatch(() => decodeURIComponent(segment));
  const value = decoded.ok ? decoded.value : segment;
  return value.slice(0, MAX_DISPLAY_PATH_SEGMENT_LENGTH);
}

function formatPathForDisplay(pathname: string): string {
  if (pathname === '/') return pathname;
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function decodeUrlForDisplay(url: string): string {
  const decoded = tryCatch(() => decodeURI(url));
  return decoded.ok ? decoded.value : url;
}

export function isAddressEntityUuid(value: unknown): boolean {
  return typeof value === 'string' && addressEntityUuidSchema.safeParse(value).success;
}

export function isRawAddressEntity(value: unknown): value is RawAddressEntity {
  return rawAddressEntitySchema.safeParse(value).success;
}

export function adaptRawAddressEntity(raw: RawAddressEntity): AddressEntity {
  const full = firstValue(raw.properties.full);
  const caption = raw.caption ?? full;

  return {
    caption,
    properties: {
      full,
      street: firstValue(raw.properties.street),
      city: firstValue(raw.properties.city),
      country: firstValue(raw.properties.country) ? resolveCountryCode(firstValue(raw.properties.country)!) : undefined,
      postalCode: firstValue(raw.properties.postalCode),
      notes: firstValue(raw.properties.notes),
    },
  };
}

export function parseStringAddress(address: string): AddressEntity {
  const segments = address
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  let country: string | undefined;
  let postalCode: string | undefined;
  let city: string | undefined;
  let streetSegments = [...segments];

  if (streetSegments.length > 0) {
    const last = streetSegments.pop()!;
    country = resolveCountryCode(last);
  }

  if (streetSegments.length > 0) {
    const candidatePostalCode = streetSegments.at(-1)!;
    if (POSTAL_CODE_PATTERN.test(candidatePostalCode)) {
      postalCode = streetSegments.pop();
    }
  }

  if (streetSegments.length > 0) {
    city = streetSegments.pop();
  }

  const street = joinStreetSegments(streetSegments);

  return {
    caption: address,
    properties: {
      full: address,
      street: street || undefined,
      city,
      postalCode,
      country,
    },
  };
}

export function getAddressDedupeKey(entity: AddressEntity): string {
  const key = entity.properties.full ?? entity.caption;
  if (key) return normalizeAddressKey(key);

  return normalizeAddressKey(
    [entity.properties.street, entity.properties.city, entity.properties.postalCode, entity.properties.country]
      .filter(Boolean)
      .join(', '),
  );
}

export function mergeAddresses(addressStrings: string[], rawAddressEntities: unknown[]): AddressEntity[] {
  const merged = new Map<string, AddressEntity>();

  for (const raw of rawAddressEntities) {
    if (isAddressEntityUuid(raw) || !isRawAddressEntity(raw)) continue;
    const entity = adaptRawAddressEntity(raw);
    merged.set(getAddressDedupeKey(entity), entity);
  }

  for (const address of addressStrings) {
    const entity = parseStringAddress(address);
    const key = getAddressDedupeKey(entity);
    if (!merged.has(key)) {
      merged.set(key, entity);
    }
  }

  return [...merged.values()];
}

/**
 * names/aliases
 */

export function getPersonName(entity: FamilyMemberRow | AssociationRow | FamilyPersonEntity | FamilyRelativeEntity) {
  const { firstName, lastName, name, alias } = entity.properties;
  if (firstName?.[0] || lastName?.[0]) return `${firstName?.[0]} ${lastName?.[0]}`.trim();
  if (name?.[0]) return name[0];
  if (alias?.[0]) return alias[0];

  return '?';
}

export function splitTextWithEmbeddedDates(value: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(EMBEDDED_ENGLISH_DATE_REGEX)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: 'text', value: value.slice(lastIndex, index) });
    }
    segments.push({ type: 'date', value: match[0] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < value.length) {
    segments.push({ type: 'text', value: value.slice(lastIndex) });
  }

  return segments;
}

export function detectNativeScript(value: string): string | null {
  const counts = new Map<string, number>();

  for (const char of value) {
    if (LATIN_OR_NEUTRAL_CHAR.test(char)) continue;

    const detector = SCRIPT_DETECTORS.find(({ test }) => test.test(char));
    if (!detector) continue;

    counts.set(detector.name, (counts.get(detector.name) ?? 0) + 1);
  }

  if (counts.size === 0) return null;

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
}

/**
 * urls
 */

export function cleanUrl(url: string) {
  const parsed = tryCatch(() => new URL(url));
  if (!parsed.ok) return url;

  const { origin, hostname, pathname } = parsed.value;

  const cleanedPathname = match(hostname)
    .when(
      (host) => host === 'web.archive.org',
      () => {
        const archiveMatch = pathname.match(/^\/web\/(\d{14})/);
        if (!archiveMatch) return trimLongTrailingPathSegments(pathname);

        const kept = `/web/${archiveMatch[1]}`;
        const removedSegments = pathname
          .slice(kept.length)
          .split('/')
          .filter((segment) => segment.length > 0);
        const lastRemoved = removedSegments.at(-1);

        if (!lastRemoved) return kept;

        return `${kept}/${segmentPreview(lastRemoved)}...`;
      },
    )
    .otherwise(() => trimLongTrailingPathSegments(pathname));

  return decodeUrlForDisplay(formatPathForDisplay(origin + cleanedPathname));
}

/**
 * birth dates
 */

export function classifyBirthDate(value: string): BirthDateKind | null {
  if (FULL_BIRTH_DATE_PATTERN.test(value)) return 'full';
  if (YEAR_ONLY_BIRTH_DATE_PATTERN.test(value)) return 'year';
  return null;
}

export function toBirthDate(value: string, kind: BirthDateKind): Temporal.PlainDate {
  if (kind === 'full') return Temporal.PlainDate.from(value);
  return Temporal.PlainDate.from(`${value}-07-01`);
}

export function getAgeYears(value: string, kind: BirthDateKind): number {
  const today = Temporal.Now.plainDateISO();
  return Math.max(0, toBirthDate(value, kind).until(today, { largestUnit: 'year' }).years);
}

export function getBirthDateRange(classified: { value: string; kind: BirthDateKind }[]): BirthDateRange | null {
  if (classified.length < 2) return null;

  const allYearOnly = classified.every((entry) => entry.kind === 'year');
  if (allYearOnly) {
    const years = classified.map((entry) => Number(entry.value)).sort((a, b) => a - b);
    const minYear = years[0]!;
    const maxYear = years[years.length - 1]!;
    if (minYear === maxYear) return null;
    return { type: 'years', minYear, maxYear };
  }

  const dates = classified.map((entry) => toBirthDate(entry.value, entry.kind)).sort(Temporal.PlainDate.compare);
  const min = dates[0]!;
  const max = dates[dates.length - 1]!;
  if (Temporal.PlainDate.compare(min, max) === 0) return null;

  if (min.year === max.year) {
    return { type: 'same_year', min, max, year: min.year };
  }

  return { type: 'full', min, max };
}

export function formatPlainDate(
  date: Temporal.PlainDate,
  language: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return formatDateTimeWithoutPresets(date.toString(), { language, ...options });
}

export function formatBirthDateRange(
  range: BirthDateRange,
  language: string,
  t: (key: string, options?: object) => string,
) {
  return match(range)
    .with({ type: 'years' }, ({ minYear, maxYear }) =>
      t('screenings:entity.property.birthDate.approximative_age.between_years', { min: minYear, max: maxYear }),
    )
    .with({ type: 'same_year' }, ({ min, max, year }) =>
      t('screenings:entity.property.birthDate.approximative_age.between_same_year', {
        min: formatPlainDate(min, language, { day: 'numeric', month: 'long' }),
        max: formatPlainDate(max, language, { day: 'numeric', month: 'long' }),
        year,
      }),
    )
    .with({ type: 'full' }, ({ min, max }) =>
      t('screenings:entity.property.birthDate.approximative_age.between_dates', {
        min: formatPlainDate(min, language, { day: 'numeric', month: 'long', year: 'numeric' }),
        max: formatPlainDate(max, language, { day: 'numeric', month: 'long', year: 'numeric' }),
      }),
    )
    .exhaustive();
}
