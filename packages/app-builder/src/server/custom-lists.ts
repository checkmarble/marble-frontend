import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { adaptCustomList, type CustomList } from '@app-builder/models/custom-list';

export async function listCustomLists(api: MarbleCoreApi): Promise<CustomList[]> {
  const { custom_lists } = await api.listCustomLists();
  return custom_lists.map(adaptCustomList);
}
