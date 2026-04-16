import { createSimpleContext } from '@marble/shared';
import type { TableField } from '../SemanticTables/Shared/semanticData-types';

export type FieldsEditorContextValue = {
  fields: TableField[];
  mainTimestampFieldName: string;
  updateField: (fieldId: string, values: Partial<TableField>) => void;
  reorderFields: (startIndex: number, endIndex: number) => void;
  addField: (name: string) => string;
  removeField: (fieldId: string) => void;
  setMainTimestampFieldName: (fieldName: string) => void;
};

export const FieldsEditorContext = createSimpleContext<FieldsEditorContextValue>('FieldsEditor');
