import { PivotObject } from '@app-builder/models/cases';
import { Client360Table } from 'marble-api';

export function getClientDisplayInfo(pivotObject: PivotObject, client360Tables: Client360Table[]) {
  const metadata = client360Tables.find((t) => t.name === pivotObject.pivotObjectName);
  const entityName = metadata?.alias || metadata?.name || pivotObject.pivotObjectName;
  const clientName = metadata ? (pivotObject.pivotObjectData.data[metadata.caption_field] as string) : '';

  return { metadata, entityName, clientName };
}
