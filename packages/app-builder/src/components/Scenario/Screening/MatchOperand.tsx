import { AstBuilder } from '@app-builder/components/AstBuilder';
import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import { type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { memo } from 'react';

export const MatchOperand = memo(function MatchOperand({
  node,
  onSave,
  placeholder,
  withDate,
}: {
  node?: KnownOperandAstNode;
  onSave?: (astNode: AstNode) => void;
  placeholder?: string;
  withDate?: boolean;
}) {
  return (
    <AstBuilder.Operand
      placeholder={placeholder}
      node={node ?? NewUndefinedAstNode()}
      optionsDataType={withDate ? ['String', 'Timestamp'] : ['String']}
      excludeFields={withDate ? ['updated_at'] : undefined}
      validationStatus="valid"
      onChange={onSave}
    />
  );
});
