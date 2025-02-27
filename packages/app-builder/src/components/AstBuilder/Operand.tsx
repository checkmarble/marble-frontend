import { type AstNode, type EnumValue } from '@app-builder/models';
import { type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';

import { Internal_EditionAstBuilderOperand } from './edition/InternalOperand';
import { type AstBuilderBaseProps } from './types';

export type AstBuilderOperandProps = AstBuilderBaseProps<KnownOperandAstNode> & {
  enumValues?: EnumValue[];
  onChange?: (node: AstNode) => void;
  placeholder?: string;
};

export function AstBuilderOperand(props: AstBuilderOperandProps) {
  return <Internal_EditionAstBuilderOperand {...props} />;
}
