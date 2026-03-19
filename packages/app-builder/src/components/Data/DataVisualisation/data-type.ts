const SEMANTIC_DATA_TYPE = {
  string: [
    'main',
    'country',
    'city',
    'phone',
    'email',
    'iban',
    'currency',
    'link',
    'code',
    'vpn',
    'free',
    'id',
    'ip_address',
  ],
  date: ['birthdate', 'date', 'datetime', 'time'],
  data: ['gps_coords', 'map'],
  number: ['integer', 'float', 'currency', 'percentile'],
  enum: ['key_value', 'colors', 'values'],
  boolean: ['checkbox', 'yes_no'],
} as const;

export type MAIN_DATA_TYPE = keyof typeof SEMANTIC_DATA_TYPE;
export type VALID_DATA_TYPE = {
  [Key in MAIN_DATA_TYPE]: `${Key}-${(typeof SEMANTIC_DATA_TYPE)[Key][number]}`;
}[MAIN_DATA_TYPE];

export const DATA_TABLE_VISUALISATION_PRESET = ['essentials', 'advanced', 'full'] as const;
export type TYPE_DATA_TABLE_VISUALISATION_PRESET = (typeof DATA_TABLE_VISUALISATION_PRESET)[number];
