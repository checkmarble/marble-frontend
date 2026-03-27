import { createSimpleContext } from '@marble/shared';
import type { TableField } from '../UploadData/uploadData-types';

export type FieldsEditorContextValue = {
  fields: TableField[];
  mainTimestampFieldId: string;
  updateField: (fieldId: string, values: Partial<TableField>) => void;
  reorderFields: (startIndex: number, endIndex: number) => void;
  addField: (name: string) => string;
  removeField: (fieldId: string) => void;
  setMainTimestampFieldId: (fieldId: string) => void;
};

export const FieldsEditorContext = createSimpleContext<FieldsEditorContextValue>('FieldsEditor');
