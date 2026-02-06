import { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { Client360Table } from 'marble-api';

export interface Client360Repository {
  getClient360Tables(): Promise<Client360Table[]>;
}

export const makeGetClient360TablesRepository =
  () =>
  (client: MarbleCoreApi): Client360Repository => ({
    getClient360Tables: async () => {
      return client.getClient360Tables();
    },
  });
