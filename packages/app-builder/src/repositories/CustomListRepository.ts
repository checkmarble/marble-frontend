import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptCustomList,
  adaptCustomListValue,
  adaptCustomListWithValues,
  type CreateCustomListBody,
  type CreateCustomListValueBody,
  type CustomList,
  type CustomListValue,
  type CustomListWithValues,
  type UpdateCustomListBody,
} from '@app-builder/models/custom-list';

export interface CustomListsRepository {
  listCustomLists(): Promise<CustomList[]>;
  createCustomList(body: CreateCustomListBody): Promise<CustomList>;
  getCustomList(id: string): Promise<CustomListWithValues>;
  updateCustomList(id: string, body: UpdateCustomListBody): Promise<CustomList>;
  deleteCustomList(id: string): Promise<void>;
  createCustomListValue(
    customListId: string,
    body: CreateCustomListValueBody,
  ): Promise<CustomListValue>;
  deleteCustomListValue(customListId: string, valueId: string): Promise<void>;
}

export function makeGetCustomListRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): CustomListsRepository => ({
    listCustomLists: async () => {
      const { custom_lists } = await marbleCoreApiClient.listCustomLists();
      return custom_lists.map(adaptCustomList);
    },
    createCustomList: async (body) => {
      const { custom_list } = await marbleCoreApiClient.createCustomList(body);
      return adaptCustomList(custom_list);
    },
    getCustomList: async (id) => {
      const { custom_list } = await marbleCoreApiClient.getCustomList(id);
      return adaptCustomListWithValues(custom_list);
    },
    updateCustomList: async (id, body) => {
      const { custom_list } = await marbleCoreApiClient.updateCustomList(id, body);
      return adaptCustomList(custom_list);
    },
    deleteCustomList: async (id) => {
      await marbleCoreApiClient.deleteCustomList(id);
    },
    createCustomListValue: async (customListId, body) => {
      const { custom_list_value } = await marbleCoreApiClient.createCustomListValue(
        customListId,
        body,
      );
      return adaptCustomListValue(custom_list_value);
    },
    deleteCustomListValue: async (customListId, valueId) => {
      await marbleCoreApiClient.deleteCustomListValue(customListId, valueId);
    },
  });
}
