import { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { PaginatedResponse } from '@app-builder/models/pagination';
import { Client360Table } from 'marble-api';

export interface Client360Repository {
  getClient360Tables(): Promise<Client360Table[]>;
  searchClient360(payload: { table: string; terms: string }): Promise<PaginatedResponse<Record<string, unknown>>>;
}

export const makeGetClient360TablesRepository =
  () =>
  (client: MarbleCoreApi): Client360Repository => ({
    getClient360Tables: async () => {
      return client.getClient360Tables();
    },
    searchClient360: async (payload: { table: string; terms: string }) => {
      const result = await client.searchClient360(payload);

      return {
        items: result.items,
        hasNextPage: result.has_next_page,
      };
    },
  });
