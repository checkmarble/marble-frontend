import { AstBuilder } from '@app-builder/components/AstBuilder';
import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import { type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { memo } from 'react';

export const MatchOperand = memo(function MatchOperand({
  node,
  onSave,
  placeholder,
}: {
  node?: KnownOperandAstNode;
  onSave?: (astNode: AstNode) => void;
  placeholder?: string;
}) {
  return (
    <AstBuilder.Operand
      placeholder={placeholder}
      node={node ?? NewUndefinedAstNode()}
      optionsDataType={['String']}
      validationStatus="valid"
      onChange={onSave}
    />
  );
});
