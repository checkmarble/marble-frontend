import type { LinkValue, TableField } from '@app-builder/components/Data/SemanticTables/Shared/semanticData-types';
import { createSimpleContext } from '@marble/shared';

export type DestinationTableOption = { tableId: string; label: string };

export type LinksEditorContextValue = {
  links: LinkValue[];
  sourceTableFields: TableField[];
  destinationTableOptions: DestinationTableOption[];
  updateLink: (linkId: string, values: Partial<LinkValue>) => void;
  addLink: () => void;
  removeLink: (linkId: string) => void;
};

export const LinksEditorContext = createSimpleContext<LinksEditorContextValue>('LinksEditor');
