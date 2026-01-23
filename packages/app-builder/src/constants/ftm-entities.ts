import { FtmEntity } from 'marble-api';

export const FTM_ENTITIES: FtmEntity[] = ['Person', 'Company', 'Organization', 'Vessel', 'Airplane'];

export const FTM_ENTITIES_PROPERTIES: Record<FtmEntity, string[]> = {
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
};
