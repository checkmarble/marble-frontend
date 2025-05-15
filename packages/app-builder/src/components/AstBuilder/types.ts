import type { AstNode } from '@app-builder/models';
import type { CustomList } from '@app-builder/models/custom-list';
import type { ReturnValueType } from '@app-builder/models/node-evaluation';
import type { FlatAstValidation } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/validate-ast';
import type { TFunction } from 'i18next';
import type { InferSharpApi } from 'sharpstate';

import type { AstBuilderNodeSharpFactory } from './edition/node-store';

type TFunctionDisplayName = TFunction<['common', 'scenarios'], undefined>;
export type AstNodeStringifierContext = {
  t: TFunctionDisplayName;
  language: string;
  customLists: CustomList[];
};

export type AstBuilderBaseProps<T extends AstNode = AstNode> = {
  node: T;
};

export type AstBuilderRootProps<NodeType extends AstNode = AstNode> = {
  node: NodeType;
  validation?: FlatAstValidation;
  onStoreChange?: (nodeStore: InferSharpApi<typeof AstBuilderNodeSharpFactory> | null) => void;
  onValidationUpdate?: (validation: FlatAstValidation) => void;
  returnType?: ReturnValueType;
};
