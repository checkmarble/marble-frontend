import { createSimpleContext } from '@marble/shared';
import type { RefObject } from 'react';
import type { LinkValue, SemanticTableFormValues, TableField } from './semanticData-types';

export const DrawerContext = createSimpleContext<{
  container: RefObject<HTMLDivElement>;
  data: unknown;
  close: () => void;
  tablesState: Record<string, SemanticTableFormValues>;
  updateTableState: (tableId: string, values: Partial<SemanticTableFormValues>) => void;
  tableIds: string[];
  linksState: Record<string, LinkValue>;
  updateLinkState: (linkId: string, values: Partial<LinkValue>) => void;
  addLink: (sourceTableId: string) => void;
  removeLink: (linkId: string) => void;
  getLinksForTable: (tableId: string) => LinkValue[];
  updateField: (tableId: string, fieldId: string, values: Partial<TableField>) => void;
  reorderFields: (tableId: string, startIndex: number, endIndex: number) => void;
  addField: (tableId: string, name: string) => string;
  removeField: (tableId: string, fieldId: string) => void;
}>('DrawerContext');
