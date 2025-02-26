import { ExternalLink } from '@app-builder/components/ExternalLink';
import { type SanctionCheckEntitySchema } from '@app-builder/models/sanction-check';

export type PropertyDataType = 'string' | 'country' | 'url' | 'date';
export type PropertyForSchema<
  Schema extends SanctionCheckEntitySchema,
  _R = never,
> = (typeof schemaInheritence)[Schema] extends null
  ? _R | (typeof schemaProperties)[Schema][number]
  : (typeof schemaInheritence)[Schema] extends infer P extends SanctionCheckEntitySchema
    ? PropertyForSchema<P, _R | (typeof schemaProperties)[Schema][number]>
    : never;

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
} satisfies Record<SanctionCheckEntitySchema, string[]>;

export type SanctionCheckEntityProperty =
  (typeof schemaProperties)[keyof typeof schemaProperties][number];

const schemaInheritence = {
  Thing: null,
  LegalEntity: 'Thing',
  Person: 'LegalEntity',
  Organization: 'LegalEntity',
  Company: 'Organization',
  Vehicle: 'Thing',
  Vessel: 'Vehicle',
  Airplane: 'Vehicle',
} satisfies Record<SanctionCheckEntitySchema, SanctionCheckEntitySchema | null>;

const propertyMetadata = {
  address: { type: 'string' },
  alias: { type: 'string' },
  appearance: { type: 'string' },
  birthDate: { type: 'date' },
  citizenship: { type: 'country' },
  classification: { type: 'string' },
  country: { type: 'country' },
  createdAt: { type: 'date' },
  deathDate: { type: 'date' },
  description: { type: 'string' },
  dissolutionDate: { type: 'date' },
  dunsCode: { type: 'string' },
  education: { type: 'string' },
  email: { type: 'string' },
  ethnicity: { type: 'string' },
  eyeColor: { type: 'string' },
  fatherName: { type: 'string' },
  firstName: { type: 'string' },
  gender: { type: 'string' },
  hairColor: { type: 'string' },
  height: { type: 'string' },
  icijId: { type: 'string' },
  idNumber: { type: 'string' },
  incorporationDate: { type: 'date' },
  innCode: { type: 'string' },
  jurisdiction: { type: 'country' },
  keywords: { type: 'string' },
  lastName: { type: 'string' },
  legalForm: { type: 'string' },
  leiCode: { type: 'string' },
  mainCountry: { type: 'country' },
  middleName: { type: 'string' },
  motherName: { type: 'string' },
  name: { type: 'string' },
  nameSuffix: { type: 'string' },
  nationality: { type: 'country' },
  notes: { type: 'string' },
  npiCode: { type: 'string' },
  ogrnCode: { type: 'string' },
  okpoCode: { type: 'string' },
  opencorporatesUrl: { type: 'url' },
  passportNumber: { type: 'string' },
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
  status: { type: 'string' },
  summary: { type: 'string' },
  swiftBic: { type: 'string' },
  taxNumber: { type: 'string' },
  title: { type: 'string' },
  uniqueEntityId: { type: 'string' },
  vatCode: { type: 'string' },
  weakAlias: { type: 'string' },
  website: { type: 'url' },
  weight: { type: 'string' },
  wikidataId: { type: 'string' },
} satisfies Record<SanctionCheckEntityProperty, { type: PropertyDataType }>;

export function getSanctionEntityProperties(schema: SanctionCheckEntitySchema) {
  let currentSchema: SanctionCheckEntitySchema | null = schema;
  const properties: SanctionCheckEntityProperty[] = [];

  do {
    properties.push(...schemaProperties[currentSchema]);
    currentSchema = schemaInheritence[currentSchema];
  } while (currentSchema !== null);

  return properties;
}

export function createPropertyTransformer(ctx: { language: string; formatLanguage: string }) {
  const intlCountry = new Intl.DisplayNames(ctx.language, { type: 'region' });
  const intlDate = new Intl.DateTimeFormat(ctx.formatLanguage, {
    dateStyle: 'short',
    timeStyle: undefined,
  });

  return function TransformProperty({
    property,
    value,
  }: {
    property: SanctionCheckEntityProperty;
    value: string;
  }) {
    const dataType = propertyMetadata[property].type;
    switch (dataType) {
      case 'string':
        return <span>{value}</span>;
      case 'url':
        return <ExternalLink href={value}>{value}</ExternalLink>;
      case 'country':
        try {
          return <span>{intlCountry.of(value.toUpperCase())}</span>;
        } catch {
          return value.toUpperCase();
        }
      case 'date':
        return <time dateTime={value}>{intlDate.format(new Date(value))}</time>;
    }
  };
}
