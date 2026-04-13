export const semanticTypeField = [
  'text',
  'name',
  'enum',
  'currency_code',
  'foreign_key',
  'country',
  'address',
  'link',
  'unique_id',
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
] as const;
export type SemanticTypeField = (typeof semanticTypeField)[number];

export function isSemanticTypeField(v: string): v is SemanticTypeField {
  return (semanticTypeField as readonly string[]).includes(v);
}

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
        { value: 'autocomplete' },
        { value: 'currency' },
        { value: 'country' },
        { value: 'key_color_value' },
        { value: 'mcc_code' },
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
  Int: [
    { value: 'number' },
    { value: 'monetary_amount' },
    { value: 'percentage' },
    { value: 'unique_id' },
    { value: 'enum' },
  ],
  Float: [
    { value: 'number' },
    { value: 'monetary_amount' },
    { value: 'percentage' },
    { value: 'unique_id' },
    { value: 'enum' },
  ],
} as const satisfies Record<string, SemanticOption[]>;

export type DataTypeKey = keyof typeof semanticTypesByDataType;

type AllSemanticOptions = (typeof semanticTypesByDataType)[DataTypeKey][number];
type OptionsWithSubOptions = Extract<AllSemanticOptions, { subOptions: readonly unknown[] }>;

export type SemanticSubTypeFieldMap = {
  [K in OptionsWithSubOptions['value']]: Extract<OptionsWithSubOptions, { value: K }>['subOptions'][number]['value'];
};

export type SemanticSubTypeField = SemanticSubTypeFieldMap[keyof SemanticSubTypeFieldMap];

const _semanticSubTypeValues = new Set<string>(
  Object.values(semanticTypesByDataType)
    .flat()
    .flatMap((o) => ('subOptions' in o && o.subOptions ? o.subOptions.map((s) => s.value) : [])),
);

export function isSemanticSubTypeField(v: string): v is SemanticSubTypeField {
  return _semanticSubTypeValues.has(v);
}
