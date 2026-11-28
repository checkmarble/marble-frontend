import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { type PaginatedResponse } from '@app-builder/models/pagination';
import { type Client360Table } from 'marble-api';

export async function getClient360Tables(api: MarbleCoreApi): Promise<Client360Table[]> {
  return api.getClient360Tables();
}

export async function searchClient360(
  api: MarbleCoreApi,
  payload: { table: string; terms: string },
): Promise<PaginatedResponse<Record<string, unknown>>> {
  const result = await api.searchClient360(payload);

  return {
    items: result.items,
    hasNextPage: result.has_next_page,
  };
}
