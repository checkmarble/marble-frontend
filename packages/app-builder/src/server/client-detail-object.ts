import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { isNotFoundHttpError } from '@app-builder/models';
import { type DataModelObject, type DataModelObjectValue } from '@app-builder/models/data-model';
import { searchClient360 } from '@app-builder/server/client-360';
import { getIngestedObject } from '@app-builder/server/data-model';

export async function loadClientDetailObject(
  api: MarbleCoreApi,
  objectType: string,
  objectId: string,
): Promise<DataModelObject> {
  try {
    return await getIngestedObject(api, objectType, objectId);
  } catch (error) {
    if (!isNotFoundHttpError(error)) throw error;

    const searchResult = await searchClient360(api, { table: objectType, terms: objectId });
    const item = searchResult.items.find((entry) => String(entry['object_id']) === objectId);
    if (!item) throw error;

    return { data: item as Record<string, DataModelObjectValue> };
  }
}
