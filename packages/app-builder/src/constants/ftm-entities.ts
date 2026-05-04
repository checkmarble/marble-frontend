import { SemanticSubTypeField, SemanticTypeField } from '@app-builder/models';
import { FtmEntity } from 'marble-api';

export const FTM_ENTITIES: FtmEntity[] = ['Person', 'Company', 'Organization', 'Vessel', 'Airplane'];

export const FTM_ENTITIES_PROPERTIES = {
  Person: [
    'name',
    'firstName',
    'lastName',
    'email',
    'phone',
    'nationality',
    'birthDate',
    'birthCountry',
    'citizenship',
    'passportNumber',
    'socialSecurityNumber',
    'idNumber',
    'country',
  ],
  Company: [
    'name',
    'registrationNumber',
    'jurisdiction',
    'country',
    'isinCode',
    'email',
    'phone',
    'website',
    'mainCountry',
  ],
  Organization: ['name', 'registrationNumber', 'jurisdiction', 'country', 'email', 'phone', 'website', 'mainCountry'],
  Vessel: ['name', 'imoNumber', 'registrationNumber', 'mmsi', 'callSign', 'country', 'flag'],
  Airplane: ['name', 'registrationNumber', 'country'],
} as const satisfies Record<FtmEntity, string[]>;

type FtmEntityProperty<T extends FtmEntity> = (typeof FTM_ENTITIES_PROPERTIES)[T][number];
export type FtmEntityPropertyKey = {
  [E in FtmEntity]: `${E}.${FtmEntityProperty<E>}`;
}[FtmEntity];

export const FTM_ENTITIES_SUGGESTIONS = {
  'Person.name': { semanticType: 'name', semanticSubType: 'caption' },
  'Person.firstName': { semanticType: 'name', semanticSubType: 'first_name' },
  'Person.lastName': { semanticType: 'name', semanticSubType: 'last_name' },
  'Person.email': { semanticType: 'link', semanticSubType: 'email' },
  'Person.phone': { semanticType: 'link', semanticSubType: 'phone' },
  'Person.country': { semanticType: 'country' },
  'Person.birthDate': { semanticType: 'date_of_birth' },
  'Company.name': { semanticType: 'name', semanticSubType: 'caption' },
  'Company.registrationNumber': { semanticType: 'unique_id', semanticSubType: 'registration_number' },
  'Company.country': { semanticType: 'country' },
  'Company.email': { semanticType: 'link', semanticSubType: 'email' },
  'Company.phone': { semanticType: 'link', semanticSubType: 'phone' },
  'Company.website': { semanticType: 'link', semanticSubType: 'url' },
  'Company.mainCountry': { semanticType: 'country' },
  'Organization.name': { semanticType: 'name', semanticSubType: 'caption' },
  'Organization.registrationNumber': { semanticType: 'unique_id', semanticSubType: 'registration_number' },
  'Organization.jurisdiction': { semanticType: 'country' },
  'Organization.country': { semanticType: 'country' },
  'Organization.email': { semanticType: 'link', semanticSubType: 'email' },
  'Organization.phone': { semanticType: 'link', semanticSubType: 'phone' },
  'Organization.website': { semanticType: 'link', semanticSubType: 'url' },
  'Organization.mainCountry': { semanticType: 'country' },
  'Vessel.name': { semanticType: 'name', semanticSubType: 'caption' },
  'Vessel.registrationNumber': { semanticType: 'unique_id', semanticSubType: 'registration_number' },
  'Vessel.country': { semanticType: 'country' },
  'Airplane.name': { semanticType: 'name', semanticSubType: 'caption' },
  'Airplane.registrationNumber': { semanticType: 'unique_id', semanticSubType: 'registration_number' },
  'Airplane.country': { semanticType: 'country' },
} as const satisfies Partial<
  Record<FtmEntityPropertyKey, { semanticType: SemanticTypeField; semanticSubType?: SemanticSubTypeField }>
>;

type FtmEntitySuggestion = { semanticType: SemanticTypeField; semanticSubType?: SemanticSubTypeField };

export function getFtmEntitySuggestion(key: FtmEntityPropertyKey): FtmEntitySuggestion | undefined {
  return (FTM_ENTITIES_SUGGESTIONS as Partial<Record<FtmEntityPropertyKey, FtmEntitySuggestion>>)[key];
}
