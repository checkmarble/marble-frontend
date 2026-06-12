import {
  DateBirthdateComponent,
  DateDatetimeComponent,
  StringCodeComponent,
  StringCountryComponent,
  StringEmailComponent,
  StringPhoneComponent,
} from '@app-builder/components/Data/DataVisualisation/DataField';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { HighlightText } from '@app-builder/components/Screenings/HighlightText';
import { screeningsI18n } from '@app-builder/components/Screenings/screenings-i18n';
import { FormatContext } from '@app-builder/contexts/FormatContext';
import { type OpenSanctionEntitySchema } from '@app-builder/models/screening';
import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { tryCatch } from '@app-builder/utils/tryCatch';
import { formatDuration as dateFnsFormatDuration } from 'date-fns/formatDuration';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Temporal } from 'temporal-polyfill';
import { match } from 'ts-pattern';
import { cn, getCountryByName } from 'ui-design-system';
import { Icon } from 'ui-icons';

const EMBEDDED_ENGLISH_DATE_REGEX =
  /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/g;

type TextSegment = { type: 'text'; value: string } | { type: 'date'; value: string };

function splitTextWithEmbeddedDates(value: string): TextSegment[] {
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

export type PropertyDataType = 'string' | 'country' | 'url' | 'date' | 'wikidataId';
export type PropertyForSchema<
  Schema extends keyof typeof schemaInheritence,
  _R = never,
> = (typeof schemaInheritence)[Schema] extends null
  ? _R | (typeof schemaProperties)[Schema][number]
  : (typeof schemaInheritence)[Schema] extends infer P extends OpenSanctionEntitySchema
    ? PropertyForSchema<P, _R | (typeof schemaProperties)[Schema][number]>
    : never;

export type SearchableSchema = 'Thing' | 'Person' | 'Organization' | 'Vehicle';

export const SEARCH_ENTITIES = {
  Thing: { fields: ['name'] },
  Person: {
    fields: ['name', 'birthDate', 'nationality', 'passportNumber', 'address'],
  },
  Organization: {
    fields: ['name', 'country', 'registrationNumber', 'address'],
  },
  Vehicle: {
    fields: ['name', 'registrationNumber'],
  },
} satisfies { [k in SearchableSchema]: { fields: PropertyForSchema<k>[] } };

export const schemaProperties = {
  Thing: [
    'name',
    'summary',
    'description',
    'country',
    'alias',
    'previousName',
    'weakAlias',
    'sourceUrl',
    'publisher',
    'wikidataId',
    'keywords',
    'address',
    'program',
    'notes',
    'createdAt',
  ] as const,
  LegalEntity: [
    'email',
    'phone',
    'website',
    'legalForm',
    'incorporationDate',
    'dissolutionDate',
    'status',
    'sector',
    'classification',
    'registrationNumber',
    'idNumber',
    'taxNumber',
    'vatCode',
    'jurisdiction',
    'mainCountry',
    'opencorporatesUrl',
    'icijId',
    'okpoCode',
    'innCode',
    'ogrnCode',
    'leiCode',
    'dunsCode',
    'uniqueEntityId',
    'npiCode',
    'swiftBic',
  ] as const,
  Person: [
    'title',
    'firstName',
    'secondName',
    'middleName',
    'fatherName',
    'motherName',
    'lastName',
    'nameSuffix',
    'birthDate',
    'deathDate',
    'position',
    'nationality',
    'citizenship',
    'passportNumber',
    'socialSecurityNumber',
    'gender',
    'ethnicity',
    'height',
    'weight',
    'eyeColor',
    'hairColor',
    'appearance',
    'religion',
    'political',
    'education',
  ] as const,
  Organization: [] as const,
  Company: [] as const,
  Vehicle: ['registrationNumber'] as const,
  Airplane: [] as const,
  Vessel: [] as const,
  Family: [] as const,
  Associate: [] as const,
  MembershipMember: [] as const,
  Sanction: [
    'country',
    'authority',
    'authorityId',
    'program',
    'startDate',
    'endDate',
    'listingDate',
    'sourceUrl',
    'reason',
    'summary',
    'programId',
    'programUrl',
  ] as const,
} satisfies Record<OpenSanctionEntitySchema, string[]>;

export type ScreeningEntityProperty = (typeof schemaProperties)[keyof typeof schemaProperties][number];

const schemaInheritence = {
  Thing: null,
  LegalEntity: 'Thing',
  Person: 'LegalEntity',
  Organization: 'LegalEntity',
  Company: 'Organization',
  Vehicle: 'Thing',
  Vessel: 'Vehicle',
  Airplane: 'Vehicle',
  Sanction: null,
  Family: null,
  Associate: null,
  MembershipMember: null,
} satisfies Record<OpenSanctionEntitySchema, OpenSanctionEntitySchema | null>;

type PropertyFormat =
  | 'monospace'
  | 'date'
  | 'dateTime'
  | 'dateOfBirth'
  | 'country'
  | 'countryFlag'
  | 'address'
  | 'position'
  | 'email'
  | 'phone';

type PropertyMetadata = {
  type: PropertyDataType;
  format?: PropertyFormat;
};

const propertyMetadata: Record<ScreeningEntityProperty, PropertyMetadata> = {
  address: { type: 'string', format: 'address' },
  alias: { type: 'string' },
  appearance: { type: 'string' },
  birthDate: { type: 'string', format: 'dateOfBirth' },
  citizenship: { type: 'string', format: 'country' },
  classification: { type: 'string' },
  country: { type: 'string', format: 'country' },
  createdAt: { type: 'string', format: 'dateTime' },
  deathDate: { type: 'string', format: 'date' },
  description: { type: 'string' },
  dissolutionDate: { type: 'string', format: 'date' },
  dunsCode: { type: 'string', format: 'monospace' },
  education: { type: 'string' },
  email: { type: 'string', format: 'email' },
  ethnicity: { type: 'string' },
  eyeColor: { type: 'string' },
  fatherName: { type: 'string' },
  firstName: { type: 'string' },
  gender: { type: 'string', format: 'monospace' },
  hairColor: { type: 'string' },
  height: { type: 'string' },
  icijId: { type: 'string' },
  idNumber: { type: 'string', format: 'monospace' },
  incorporationDate: { type: 'string', format: 'date' },
  innCode: { type: 'string' },
  jurisdiction: { type: 'string', format: 'country' },
  keywords: { type: 'string' },
  lastName: { type: 'string' },
  legalForm: { type: 'string' },
  leiCode: { type: 'string' },
  mainCountry: { type: 'string', format: 'country' },
  middleName: { type: 'string' },
  motherName: { type: 'string' },
  name: { type: 'string' },
  nameSuffix: { type: 'string' },
  nationality: { type: 'string', format: 'country' },
  notes: { type: 'string' },
  npiCode: { type: 'string' },
  ogrnCode: { type: 'string' },
  okpoCode: { type: 'string' },
  opencorporatesUrl: { type: 'url' },
  passportNumber: { type: 'string', format: 'monospace' },
  phone: { type: 'string' },
  political: { type: 'string' },
  position: { type: 'string' },
  previousName: { type: 'string' },
  program: { type: 'string' },
  publisher: { type: 'string' },
  registrationNumber: { type: 'string' },
  religion: { type: 'string' },
  secondName: { type: 'string' },
  sector: { type: 'string' },
  socialSecurityNumber: { type: 'string' },
  sourceUrl: { type: 'url' },
  status: { type: 'string', format: 'monospace' },
  summary: { type: 'string' },
  swiftBic: { type: 'string' },
  taxNumber: { type: 'string' },
  title: { type: 'string' },
  uniqueEntityId: { type: 'string' },
  vatCode: { type: 'string' },
  weakAlias: { type: 'string' },
  website: { type: 'url' },
  weight: { type: 'string' },
  wikidataId: { type: 'wikidataId' },
  authority: { type: 'string' },
  authorityId: { type: 'string' },
  startDate: { type: 'string', format: 'date' },
  endDate: { type: 'string', format: 'date' },
  programId: { type: 'string' },
  programUrl: { type: 'url' },
  reason: { type: 'string' },
  listingDate: { type: 'string', format: 'dateTime' },
};

// list of properties that are displayed in a list, not inline
export const propertyMetadataList: Array<keyof typeof propertyMetadata> = ['address'];

export function getSanctionEntityProperties(schema: OpenSanctionEntitySchema) {
  let currentSchema: OpenSanctionEntitySchema | null = schema;
  const properties: ScreeningEntityProperty[] = [];

  do {
    properties.push(...schemaProperties[currentSchema]);
    currentSchema = schemaInheritence[currentSchema];
  } while (currentSchema !== null);

  return properties;
}

export function isPropertyListed(property: ScreeningEntityProperty) {
  return propertyMetadataList.includes(property);
}

export function createPropertyTransformer(ctx: { language: string; formatLanguage: string; highlightText?: string }) {
  return function TransformProperty({ property, value }: { property: ScreeningEntityProperty; value: string }) {
    const { type, format } = propertyMetadata[property];
    switch (type) {
      case 'string':
        return value.includes('\n')
          ? value
              .split('\n')
              .map((v, index) =>
                v ? (
                  <div key={`chunk-${index}`}>{formatedValue(format, v, ctx.highlightText)}</div>
                ) : (
                  <br key={`chunk-${index}`} />
                ),
              )
          : formatedValue(format, value, ctx.highlightText);
      case 'url':
        return (
          <ExternalLink className="break-all" href={value} title={value}>
            {cleanUrl(value)}
          </ExternalLink>
        );

      case 'wikidataId':
        return (
          <ExternalLink href={`https://wikidata.org/wiki/${value}`} className="normal-case break-all">
            {cleanUrl(value)}
          </ExternalLink>
        );
    }
  };
}

const MAX_DISPLAY_PATH_SEGMENT_LENGTH = 20;

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

// format values using the components of the data field component
function formatedValue(format: PropertyFormat | undefined, value: string, highlightText?: string) {
  const { locale } = FormatContext.useValue();
  return match(format)
    .with('monospace', () => StringCodeComponent({ value }))
    .with('date', () => (
      <time dateTime={value}>{formatDateTimeWithoutPresets(value, { language: locale, dateStyle: 'short' })}</time>
    ))
    .with('dateTime', () => (
      <time dateTime={value}>
        {formatDateTimeWithoutPresets(value, { language: locale, dateStyle: 'short', timeStyle: 'short' })}
      </time>
    ))
    .with('dateOfBirth', () => DateBirthdateComponent({ value }))
    .with('country', () => StringCountryComponent({ value, withCountryName: true }))
    .with('countryFlag', () => StringCountryComponent({ value, withCountryName: false }))
    .with('address', () => <ParseAddress address={value} />)
    .with('position', () => <span>{value}</span>)
    .with('email', () => StringEmailComponent({ value }))
    .with('phone', () => StringPhoneComponent({ value }))
    .with(undefined, () => <TextWithEmbeddedDates value={value} highlightText={highlightText} />)
    .exhaustive();
}

// highlight the dates and show them in the locale formet
// not sure if this one is really relevant
function TextWithEmbeddedDates({ value, highlightText }: { value: string; highlightText?: string }) {
  const segments = splitTextWithEmbeddedDates(value);

  if (segments.length === 0) {
    return <HighlightText text={value} highlight={highlightText} />;
  }

  return (
    <>
      {segments.map((segment, index) =>
        segment.type === 'date' ? (
          <Fragment key={index}>
            {DateDatetimeComponent({ value: segment.value, withTime: false, monospaced: true })}
          </Fragment>
        ) : segment.value.length > 0 ? (
          <HighlightText key={index} text={segment.value} highlight={highlightText} />
        ) : null,
      )}
    </>
  );
}

// try to figure out the country to display it with the fancy flag
function ParseAddress({ address }: { address: string }) {
  const addressParts = address.split(',');
  return (
    <li className="flex items-center gap-V2-sm">
      <IconDot dark spaced />
      {addressParts.map((part, index) => {
        const trimmedPart = part.trim();
        const isLastPart = index === addressParts.length - 1;
        const country = isLastPart ? getCountryByName(trimmedPart) : undefined;

        return (
          <div key={`${index}-${trimmedPart}`} className="h-full flex items-center gap-v2-sm me-v2-sm">
            {country ? (
              StringCountryComponent({ value: country.isoAlpha2, withCountryName: true })
            ) : (
              <span>{trimmedPart}</span>
            )}
            {index < addressParts.length - 1 ? <IconDot /> : null}
          </div>
        );
      })}
    </li>
  );
}

export function IconDot({ dark, spaced }: { dark?: boolean; spaced?: boolean }) {
  return (
    <Icon
      icon="dot"
      className={cn(
        'text-grey-border size-1.5 shrink-0 inline-block',
        dark && 'text-grey-secondary opacity-100',
        spaced && 'mx-v2-sm',
        dark && spaced && 'ms-0',
      )}
    />
  );
}

const FULL_BIRTH_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const YEAR_ONLY_BIRTH_DATE_PATTERN = /^\d{4}$/;

type BirthDateKind = 'full' | 'year';

function classifyBirthDate(value: string): BirthDateKind | null {
  if (FULL_BIRTH_DATE_PATTERN.test(value)) return 'full';
  if (YEAR_ONLY_BIRTH_DATE_PATTERN.test(value)) return 'year';
  return null;
}

function toBirthDate(value: string, kind: BirthDateKind): Temporal.PlainDate {
  if (kind === 'full') return Temporal.PlainDate.from(value);
  return Temporal.PlainDate.from(`${value}-07-01`);
}

function getAgeYears(value: string, kind: BirthDateKind): number {
  const today = Temporal.Now.plainDateISO();
  return Math.max(0, toBirthDate(value, kind).until(today, { largestUnit: 'year' }).years);
}

type BirthDateRange =
  | { type: 'years'; minYear: number; maxYear: number }
  | { type: 'same_year'; min: Temporal.PlainDate; max: Temporal.PlainDate; year: number }
  | { type: 'full'; min: Temporal.PlainDate; max: Temporal.PlainDate };

function getBirthDateRange(classified: { value: string; kind: BirthDateKind }[]): BirthDateRange | null {
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

function formatPlainDate(date: Temporal.PlainDate, language: string, options: Intl.DateTimeFormatOptions): string {
  return formatDateTimeWithoutPresets(date.toString(), { language, ...options });
}

function formatBirthDateRange(range: BirthDateRange, language: string, t: (key: string, options?: object) => string) {
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

function ApproximativeAge({ ageYears, range }: { ageYears: number; range: BirthDateRange | null }) {
  const language = useFormatLanguage();
  const { t } = useTranslation(screeningsI18n);
  const formatted = dateFnsFormatDuration(
    { years: Math.max(0, Math.round(ageYears)) },
    { locale: getDateFnsLocale(language) },
  );
  const rangeLabel = range ? formatBirthDateRange(range, language, t) : null;

  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-grey-secondary text-xs">
        ~{formatted}
        {rangeLabel ? ` ${rangeLabel}` : null}
      </span>
    </span>
  );
}

export function BirthdDateAverage({ values }: { values: string[] }) {
  const classified = values
    .map((value) => ({ value, kind: classifyBirthDate(value) }))
    .filter((entry): entry is { value: string; kind: BirthDateKind } => entry.kind !== null);

  if (classified.length === 0) {
    const fallback = values[0];
    return fallback ? DateBirthdateComponent({ value: fallback }) : null;
  }

  if (classified.length === 1) {
    const entry = classified[0]!;
    if (entry.kind === 'full') {
      return DateBirthdateComponent({ value: entry.value });
    }
    return <ApproximativeAge ageYears={getAgeYears(entry.value, entry.kind)} range={null} />;
  }

  const averageAge = classified.reduce((sum, { value, kind }) => sum + getAgeYears(value, kind), 0) / classified.length;

  return <ApproximativeAge ageYears={averageAge} range={getBirthDateRange(classified)} />;
}
