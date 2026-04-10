import { DataType, TableModel } from '@app-builder/models';
import { parseUnknownData } from '@app-builder/utils/parse';
import * as R from 'remeda';
import { SemanticSubTypeField, SemanticTypeField } from '../SemanticTables/Shared/semanticData-types';
import { VALID_DATA_TYPE } from './data-type';

export const CARTO_BASEMAP = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
} as const;

export const MAP_HEIGHT = 200;

export function isValidCoords(latitude: number, longitude: number) {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

export function resolveCoords(value: unknown): { latitude: number; longitude: number } | null {
  if (typeof value === 'string' && value) {
    return parseCoords(value);
  }
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    const lat = obj['latitude'] ?? obj['lat'];
    const lng = obj['longitude'] ?? obj['lng'] ?? obj['lon'];
    if (typeof lat === 'number' && typeof lng === 'number' && isValidCoords(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }
  return null;
}

export function parseCoords(s: string) {
  const [lat, lng] = s.split(',');
  const latitude = parseFloat(lat ?? '');
  const longitude = parseFloat(lng ?? '');
  if (isNaN(latitude) || isNaN(longitude)) return null;
  if (latitude < -90 || latitude > 90) return null;
  if (longitude < -180 || longitude > 180) return null;
  return { latitude, longitude, zoom: 5 };
}

export function hasMetadataContent(data: ReturnType<typeof parseUnknownData> | undefined): boolean {
  if (!data) return false;
  if (data.type === 'DerivedData') return Object.keys(data.value).length > 0;
  return R.isNonNullish(data.value);
}

export function isMetadataKey(key: string): { match: true; parentKey: string } | { match: false } {
  const suffix = '.metadata';
  if (key.endsWith(suffix)) {
    return { match: true, parentKey: key.slice(0, -suffix.length) };
  }
  // Handle keys with surrounding quotes (some API formats)
  const trimmed = key.replace(/^["']|["']$/g, '');
  if (trimmed !== key && trimmed.endsWith(suffix)) {
    return { match: true, parentKey: trimmed.slice(0, -suffix.length) };
  }
  return { match: false };
}

export const METADATA_FIELDS = ['object_id', 'valid_from'] as const;

export function getLinksFromDatamodel(dataModel: TableModel[], tableName: string) {
  const dataModelTable = dataModel.find((table) => table.name === tableName);
  const links = R.pipe(
    dataModelTable?.linksToSingle ?? [],
    R.mapToObj((link) => {
      return [link.childFieldName, link.parentTableName];
    }),
  );
  return links;
}

export function inferDataTypeFromName(name: string, dataType: DataType): VALID_DATA_TYPE {
  if (dataType === 'Coords' || dataType === 'Coords[]') return 'data-gps_coords';
  if (dataType === 'IpAddress' || dataType === 'IpAddress[]') return 'data-ip_address';
  if (dataType === 'Bool' || dataType === 'Bool[]') return 'boolean-checkbox';

  switch (dataType) {
    case 'String':
    case 'String[]':
    case 'DerivedData':
    case 'unknown':
      if (/name/i.test(name)) return 'string-main';
      if (/email/i.test(name)) return 'string-email';
      if (/phone/i.test(name)) return 'string-phone';
      if (/city/i.test(name)) return 'string-city';
      if (/country/i.test(name)) return 'string-country';
      if (/_id/i.test(name)) return 'string-id';
      if (/iban/i.test(name)) return 'string-iban';
      if (/currency/i.test(name)) return 'string-currency';
      if (/curr_/i.test(name)) return 'string-currency';
      if (/url/i.test(name)) return 'string-link';
      if (/code/i.test(name)) return 'string-code';
      if (/vpn/i.test(name)) return 'string-vpn';
      if (/status/i.test(name)) return 'enum-values';
      return 'string-free';
    case 'Timestamp':
    case 'Timestamp[]':
      if (/birthdate/i.test(name)) return 'date-birthdate';
      return 'date-datetime';
    case 'Int':
    case 'Int[]':
      return 'number-integer';
    case 'Float':
    case 'Float[]':
      if (/amount/i.test(name)) return 'number-currency';
      return 'number-float';
    default:
      throw new Error(`Unhandled data type: ${dataType satisfies never}`);
  }
}

export function inferSemanticTypeFromName(
  name: string,
  dataType: DataType,
): { semanticType: SemanticTypeField; semanticSubType?: SemanticSubTypeField } {
  switch (dataType) {
    case 'String':
    case 'String[]':
    case 'DerivedData':
    case 'unknown':
      if (/first_name|firstname/i.test(name)) return { semanticType: 'name', semanticSubType: 'first_name' };
      if (/last_name|lastname/i.test(name)) return { semanticType: 'name', semanticSubType: 'last_name' };
      if (/name/i.test(name)) return { semanticType: 'name', semanticSubType: 'caption' };
      if (/email/i.test(name)) return { semanticType: 'link', semanticSubType: 'email' };
      if (/phone/i.test(name)) return { semanticType: 'link', semanticSubType: 'phone' };
      if (/city/i.test(name)) return { semanticType: 'address' };
      if (/country/i.test(name)) return { semanticType: 'country' };
      if (/_id/i.test(name)) return { semanticType: 'unique_id' };
      if (/iban/i.test(name)) return { semanticType: 'account_identifier', semanticSubType: 'iban' };
      if (/currency|curr_/i.test(name)) return { semanticType: 'currency_code' };
      if (/url/i.test(name)) return { semanticType: 'link', semanticSubType: 'url' };
      if (/account/i.test(name)) return { semanticType: 'account_identifier', semanticSubType: 'account_number' };
      return { semanticType: 'text' };
    case 'Timestamp':
    case 'Timestamp[]':
      if (/birthdate/i.test(name)) return { semanticType: 'date_of_birth' };
      if (/deletion|delete/i.test(name)) return { semanticType: 'deletion_date' };
      if (/creat/i.test(name)) return { semanticType: 'creation_date' };
      if (/updat/i.test(name)) return { semanticType: 'last_update' };
      if (/valid/i.test(name)) return { semanticType: 'validation_date' };
      return { semanticType: 'timestamp' };
    case 'Int':
    case 'Int[]':
    case 'Float':
    case 'Float[]':
      if (/amount/i.test(name)) return { semanticType: 'monetary_amount' };
      return { semanticType: 'number' };
    case 'Bool':
    case 'Bool[]':
    case 'Coords':
    case 'Coords[]':
    case 'IpAddress':
    case 'IpAddress[]':
      return { semanticType: 'text' };
    default:
      throw new Error(`Unhandled data type: ${dataType satisfies never}`);
  }
}
