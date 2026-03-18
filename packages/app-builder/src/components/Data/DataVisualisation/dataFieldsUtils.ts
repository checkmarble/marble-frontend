import { TableModel } from '@app-builder/models';
import { parseUnknownData } from '@app-builder/utils/parse';
import * as R from 'remeda';

export const CARTO_BASEMAP = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
} as const;

export const MAP_HEIGHT = 400;

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
  return false;
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

export function getLinkksFromDatamodel(dataModel: TableModel[], tableName: string) {
  const dataModelTable = dataModel.find((table) => table.name === tableName);
  const links = R.pipe(
    dataModelTable?.linksToSingle ?? [],
    R.mapToObj((link) => {
      return [link.childFieldName, link.parentTableName];
    }),
  );
  return links;
}
