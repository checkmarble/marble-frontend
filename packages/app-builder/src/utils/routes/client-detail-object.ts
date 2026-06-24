import { isNotFoundHttpError } from '@app-builder/models';
import { type DataModelObject, type DataModelObjectValue } from '@app-builder/models/data-model';
import { type Client360Repository } from '@app-builder/repositories/Client360Repository';
import { type DataModelRepository } from '@app-builder/repositories/DataModelRepository';

export async function loadClientDetailObject(
  dataModelRepository: DataModelRepository,
  client360: Client360Repository,
  objectType: string,
  objectId: string,
): Promise<DataModelObject> {
  try {
    return await dataModelRepository.getIngestedObject(objectType, objectId);
  } catch (error) {
    if (!isNotFoundHttpError(error)) throw error;

    const searchResult = await client360.searchClient360({ table: objectType, terms: objectId });
    const item = searchResult.items.find((entry) => String(entry['object_id']) === objectId);
    if (!item) throw error;

    return { data: item as Record<string, DataModelObjectValue> };
  }
}
