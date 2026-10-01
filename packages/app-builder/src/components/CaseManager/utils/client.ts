import { CaseClient } from '@app-builder/models/cases';
import { Client360Table } from 'marble-api';

export function getClientDisplayInfo(client: CaseClient, client360Tables: Client360Table[]) {
  const metadata = client360Tables.find((t) => t.name === client.tableName);
  const entityName = metadata?.alias || metadata?.name || client.tableName;
  const clientName = metadata ? (client.object.data[metadata.caption_field] as string | undefined) : undefined;

  return { metadata, entityName, clientName: clientName ?? '' };
}
