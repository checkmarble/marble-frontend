import { type AstNode, type DataType, type EnumValue } from '@app-builder/models';
import { type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';

import { EditionAstBuilderOperand } from './edition/EditionOperand';
import { type EnrichedMenuOption } from './edition/helpers';
import { AstBuilderDataSharpFactory } from './Provider';
import { type AstBuilderBaseProps } from './types';
import { ViewingAstBuilderOperand } from './viewing/ViewingOperand';

export type AstBuilderOperandProps = AstBuilderBaseProps<KnownOperandAstNode> & {
  enumValues?: EnumValue[];
  showErrors?: boolean;
  placeholder?: string;
  onChange?: (node: AstNode) => void;
  optionsDataType?: DataType[] | ((o: EnrichedMenuOption) => boolean);
  coerceDataType?: DataType[];
  returnValue?: string;
} & { validationStatus?: 'valid' | 'error' | 'light-error' };

export function AstBuilderOperand(props: AstBuilderOperandProps) {
  const builderMode = AstBuilderDataSharpFactory.select((s) => s.mode);
  return builderMode === 'edit' ? (
    <EditionAstBuilderOperand {...props} />
  ) : (
    <ViewingAstBuilderOperand {...props} />
  );
}
