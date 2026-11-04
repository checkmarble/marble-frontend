import type { TableModel } from '@app-builder/models/data-model';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';

/** The table of the data model, when it is loaded. */
export function useTableModel(table: string): TableModel | undefined {
  const dataModel = useDataModelQuery();
  return dataModel.data?.dataModel.find((entry) => entry.name === table);
}

/**
 * The caption of a record of the client base: the value of the caption field of its table, read
 * through the object details. `null` while it loads, when the table has no caption field of its
 * own, or when the record cannot be read (the id is then all there is to show).
 */
export function useRecordCaption(table: string, recordId: string): string | null {
  const model = useTableModel(table);
  const captionField = model?.captionField && model.captionField !== 'object_id' ? model.captionField : undefined;
  const details = useObjectDetailsQuery(table, recordId, captionField !== undefined);
  const value = captionField ? details.data?.data?.[captionField] : undefined;
  return typeof value === 'string' || typeof value === 'number' ? String(value) : null;
}
