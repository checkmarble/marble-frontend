import { FtmEntityPersonOption, FtmEntityV2, LinkRelationType, type PrimitiveTypes } from '@app-builder/models';
import { FtmEntity } from 'marble-api';
import { match } from 'ts-pattern';

export type LinkValue = {
  linkId: string;
  name: string;
  sourceTableId: string;
  tableFieldId: string;
  relationType: LinkRelationType;
  targetTableId: string;
};

export type RawLink = {
  id: string;
  name: string;
  parent_table_name: string;
  parent_table_id: string;
  parent_field_name: string;
  parent_field_id: string;
  child_table_name: string;
  child_table_id: string;
  child_field_name: string;
  child_field_id: string;
};

export type RawField = {
  id: string;
  name: string;
  description: string;
  data_type: PrimitiveTypes;
  table_id: string;
  is_enum?: boolean;
  nullable?: boolean;
  values?: (string | number)[];
  unicity_constraint?: string;
  ftm_property?: string;
};

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

export const semanticTypeTable = ['person', 'company', 'account', 'transaction', 'event', 'partner', 'other'] as const;
export type SemanticTypeTable = (typeof semanticTypeTable)[number];

export type TableField = {
  id: string;
  name: string;
  description: string;
  dataType: PrimitiveTypes;
  tableId: string;
  isEnum: boolean;
  nullable: boolean;
  alias: string;
  hidden: boolean;
  order: number;
  unicityConstraint: string;
  ftmProperty?: string;
  semanticType: SemanticTypeField;
  semanticSubType?: SemanticSubTypeField;
  currencyExponent?: number;
  decimalPrecision?: number;
  currencyFieldId?: string;
  booleanDisplay?: 'yes_no' | 'checkbox';
  foreignkeyTable?: string;
  isDefaultBelongsTo?: boolean;
  enumValues?: { key: string; color: EnumColors; value: string }[];
  isNew: boolean;
  locked?: boolean;
};

export const semanticTypeField = [
  'text',
  'name',
  'enum',
  'currency_code',
  'foreign_key',
  'country',
  'address',
  'unique_id',
  'link',
  'account_identifier',
  'timestamp',
  'date_of_birth',
  'last_update',
  'creation_date',
  'deletion_date',
  'initiation_date',
  'validation_date',
  'number',
  'monetary_amount',
  'percentage',
  'unique_id',
  'number',
  'monetary_amount',
  'percentage',
  'unique_id',
] as const;
export type SemanticTypeField = (typeof semanticTypeField)[number];

type SemanticOption = {
  value: SemanticTypeField;
  subOptions?: { value: string }[];
};

export const semanticTypesByDataType = {
  String: [
    { value: 'text' },
    {
      value: 'name',
      subOptions: [{ value: 'caption' }, { value: 'first_name' }, { value: 'last_name' }, { value: 'middle_name' }],
    },
    {
      value: 'enum',
      subOptions: [
        { value: 'currency' },
        { value: 'country' },
        { value: 'key_color_value' },
        { value: 'mcc_code' },
        { value: 'autocomplete' },
      ],
    },
    { value: 'currency_code' },
    { value: 'foreign_key' },
    { value: 'country' },
    { value: 'address' },
    {
      value: 'unique_id',
      subOptions: [{ value: 'registration_number' }, { value: 'tax_id' }, { value: 'opaque_id' }],
    },
    {
      value: 'link',
      subOptions: [{ value: 'url' }, { value: 'email' }, { value: 'phone' }],
    },
    {
      value: 'account_identifier',
      subOptions: [{ value: 'account_number' }, { value: 'iban' }, { value: 'bic' }],
    },
  ],
  Timestamp: [
    { value: 'timestamp' },
    { value: 'date_of_birth' },
    { value: 'last_update' },
    { value: 'creation_date' },
    { value: 'deletion_date' },
    { value: 'initiation_date' },
    { value: 'validation_date' },
  ],
  Int: [{ value: 'number' }, { value: 'monetary_amount' }, { value: 'percentage' }, { value: 'unique_id' }],
  Float: [{ value: 'number' }, { value: 'monetary_amount' }, { value: 'percentage' }, { value: 'unique_id' }],
} as const satisfies Record<string, SemanticOption[]>;

export type DataTypeKey = keyof typeof semanticTypesByDataType;

type AllSemanticOptions = (typeof semanticTypesByDataType)[DataTypeKey][number];
type OptionsWithSubOptions = Extract<AllSemanticOptions, { subOptions: readonly unknown[] }>;

export type SemanticSubTypeFieldMap = {
  [K in OptionsWithSubOptions['value']]: Extract<OptionsWithSubOptions, { value: K }>['subOptions'][number]['value'];
};

export type SemanticSubTypeField = SemanticSubTypeFieldMap[keyof SemanticSubTypeFieldMap];

export function getSemanticSubOptions(
  dataType: DataTypeKey,
  semanticType: SemanticTypeField,
): { value: string }[] | undefined {
  const options = semanticTypesByDataType[dataType];
  if (!options) return undefined;
  const match = options.find((o) => o.value === semanticType);
  return match && 'subOptions' in match ? (match.subOptions as { value: string }[]) : undefined;
}

export type SemanticTableFormValues = {
  tableId: string;
  name: string;
  alias: string;
  entityType: FtmEntityV2;
  subEntity: FtmEntityPersonOption;
  belongsToTableId: string;
  fields: TableField[];
  mainTimestampFieldName: string;
  links: LinkValue[];
  metaData: Record<string, unknown>;
  isCanceled: boolean;
  isVisited: boolean;
  ftmEntity?: FtmEntity;
};

export type SemanticTableChangedProperty = Exclude<keyof SemanticTableFormValues, 'fields' | 'links' | 'isVisited'>;

export type ChangeRecord =
  | { type: 'table'; operation: 'MOD'; changedProperties: SemanticTableChangedProperty[] }
  | { type: 'field'; operation: 'MOD' | 'DEL'; objectId: string }
  | { type: 'field'; operation: 'ADD'; objectName: string }
  | { type: 'link'; operation: 'MOD' | 'DEL'; objectId: string }
  | { type: 'link'; operation: 'ADD'; objectName: string };

export function getMockValue(
  dataType: PrimitiveTypes,
  semanticType?: SemanticTypeField,
  semanticSubType?: SemanticSubTypeField | undefined,
) {
  if (dataType === 'Coords') return '48.8566, 2.3522';
  if (dataType === 'IpAddress') return '127.0.0.1';
  if (!semanticType) {
    return match(dataType)
      .with('String', () => 'Welcome to Marble')
      .with('Timestamp', () => '2021-01-01T14:20:00.000Z')
      .with('Int', () => 42)
      .with('Float', () => 1234567890)
      .with('Bool', () => true)
      .exhaustive();
  }
  const value = match(semanticType)
    .with('text', () => 'Welcome to Marble')
    .with('name', () =>
      semanticSubType
        ? match(semanticSubType as SemanticSubTypeFieldMap['name'])
            .with('caption', () => 'Company name or John Doe Jr')
            .with('first_name', () => 'John')
            .with('last_name', () => 'Doe')
            .with('middle_name', () => 'Jr')
            .exhaustive()
        : 'John Doe Jr',
    )
    .with('enum', () =>
      semanticSubType
        ? match(semanticSubType as SemanticSubTypeFieldMap['enum'])
            .with('currency', () => 'EUR')
            .with('country', () => 'FR')
            .with('key_color_value', () => 'value from enum')
            .with('mcc_code', () => '5219')
            .with('autocomplete', () => 'Autocompleted value')
            .exhaustive()
        : 'Enum value',
    )
    .with('currency_code', () => 'EUR')
    .with('foreign_key', () => 'ForeignKey')
    .with('country', () => 'FR')
    .with('address', () => '123 Main St, Anytown, USA')
    .with('unique_id', () =>
      semanticSubType
        ? match(semanticSubType as SemanticSubTypeFieldMap['unique_id'])
            .with('registration_number', () => 'REG1234567890')
            .with('tax_id', () => 'TAX1234567890')
            .with('opaque_id', () => '58e6908a-4eab-4985-8ebe-00b2f6900507')
            .exhaustive()
        : 'Unique ID value',
    )
    .with('link', () =>
      semanticSubType
        ? match(semanticSubType as SemanticSubTypeFieldMap['link'])
            .with('url', () => 'https://www.google.com')
            .with('email', () => 'john.doe@example.com')
            .with('phone', () => '+33612345678')
            .exhaustive()
        : 'Link value',
    )
    .with('account_identifier', () =>
      semanticSubType
        ? match(semanticSubType as SemanticSubTypeFieldMap['account_identifier'])
            .with('account_number', () => '12345678901234567890')
            .with('iban', () => 'FR7612345678901234567890123')
            .with('bic', () => 'TRZFR32AXXX')
            .exhaustive()
        : 'Account identifier value',
    )
    .with('timestamp', () => '2021-01-01T14:20:00.000Z')
    .with('date_of_birth', () => '1990-01-01')
    .with('last_update', () => '2021-01-01T14:20:00.000Z')
    .with('creation_date', () => '2021-01-01T14:20:00.000Z')
    .with('deletion_date', () => '2021-01-01T14:20:00.000Z')
    .with('initiation_date', () => '2021-01-01T14:20:00.000Z')
    .with('validation_date', () => '2021-01-01T14:20:00.000Z')
    .with('number', () => 42)
    .with('monetary_amount', () => 1234567890)
    .with('percentage', () => 0.34)
    .exhaustive();
  return value;
}
