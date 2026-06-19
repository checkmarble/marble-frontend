import type { LinkValue, TableField } from '@app-builder/components/Data/SemanticTables/Shared/semanticData-types';
import { createSimpleContext } from '@marble/shared';

export const CREATE_TABLE_SELF_LINK_TARGET_ID = '__create_table_self_link__';

export type DestinationTableOption = {
  tableId: string;
  label: string;
  isCurrentTable?: boolean;
};

export type LinksEditorContextValue = {
  links: LinkValue[];
  /** Display name of the table whose links are being edited (alias, falling back to name). */
  sourceTableName: string;
  sourceTableFields: TableField[];
  destinationTableOptions: DestinationTableOption[];
  updateLink: (linkId: string, values: Partial<LinkValue>) => void;
  addLink: () => void;
  removeLink: (linkId: string) => void;
};

export const LinksEditorContext = createSimpleContext<LinksEditorContextValue>('LinksEditor');
