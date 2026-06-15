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
import {
  cleanUrl,
  splitTextWithEmbeddedDates,
} from '@app-builder/components/Screenings/MatchCard/match-card-utility-functions';
import { FormatContext } from '@app-builder/contexts/FormatContext';
import { type OpenSanctionEntitySchema } from '@app-builder/models/screening';
import { formatDateTimeWithoutPresets } from '@app-builder/utils/format';
import { Fragment } from 'react';
import { match } from 'ts-pattern';

export {
  BirthdDateAverage,
  IconDot,
  ParseAddress,
  ParseAlias,
} from '@app-builder/components/Screenings/MatchCard/match-card-entity-components';
export {
  cleanUrl,
  detectNativeScript,
} from '@app-builder/components/Screenings/MatchCard/match-card-utility-functions';

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
    'addressEntity',
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
  | 'position'
  | 'email'
  | 'phone';

type PropertyMetadata = {
  type: PropertyDataType;
  format?: PropertyFormat;
};

const propertyMetadata: Record<ScreeningEntityProperty, PropertyMetadata> = {
  address: { type: 'string' },
  addressEntity: { type: 'string' },
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
  phone: { type: 'string', format: 'phone' },
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

/**
 * fields that are tagged with a native script
 */
const SCRIPT_TAGGED_PROPERTIES = [
  'name',
  'title',
  'firstName',
  'secondName',
  'middleName',
  'fatherName',
  'motherName',
  'lastName',
  'nameSuffix',
  'alias',
  'weakAlias',
  'previousName',
] as const satisfies ScreeningEntityProperty[];

// list of properties that are displayed in a list, not inline
export const propertyMetadataList: Array<keyof typeof propertyMetadata> = [
  'address',
  'addressEntity',
  ...SCRIPT_TAGGED_PROPERTIES,
];

export function isScriptTaggedProperty(property: ScreeningEntityProperty) {
  return (SCRIPT_TAGGED_PROPERTIES as readonly string[]).includes(property);
}

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
    .with('position', () => <span>{value}</span>)
    .with('email', () => StringEmailComponent({ value }))
    .with('phone', () => StringPhoneComponent({ value }))
    .with(undefined, () => <TextWithEmbeddedDates value={value} highlightText={highlightText} />)
    .exhaustive();
}

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
            {DateDatetimeComponent({
              value: segment.value,
              withTime: false,
              monospaced: true,
              className: 'p-0 inline-block',
            })}
          </Fragment>
        ) : segment.value.length > 0 ? (
          <HighlightText key={index} text={segment.value} highlight={highlightText} />
        ) : null,
      )}
    </>
  );
}
