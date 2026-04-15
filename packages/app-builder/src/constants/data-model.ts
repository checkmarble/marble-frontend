import { FieldSemanticType } from 'marble-api';

// need it as an array from the backend enum for zod validation
export const semanticFieldForBack: FieldSemanticType[] = [
  'name',
  'first_name',
  'middle_name',
  'last_name',
  'enum',
  'currency',
  'foreign_key',
  'country',
  'address',
  'id',
  'registration_number',
  'tax_id',
  'account_number',
  'iban',
  'bic',
  'url',
  'email',
  'phone_number',
  'date_of_birth',
  'last_update',
  'creation_date',
  'deletion_date',
  'initiation_date',
  'validation_date',
  'monetary_amount',
  'percentage',
];
export type SemanticFieldForBack = FieldSemanticType;
