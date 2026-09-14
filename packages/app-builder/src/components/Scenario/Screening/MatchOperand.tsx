import { AstBuilder } from '@app-builder/components/AstBuilder';
import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import { type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { memo } from 'react';

export type OperandDisplayDateOptions = 'all' | 'fields' | 'functions';

export const MatchOperand = memo(function MatchOperand({
  node,
  onSave,
  placeholder,
  withDate,
}: {
  node?: KnownOperandAstNode;
  onSave?: (astNode: AstNode) => void;
  placeholder?: string;
  withDate?: OperandDisplayDateOptions;
}) {
  return (
    <AstBuilder.Operand
      placeholder={placeholder}
      node={node ?? NewUndefinedAstNode()}
      optionsDataType={withDate === 'all' || withDate === 'fields' ? ['String', 'Timestamp'] : ['String']}
      excludeFuntionsType={withDate === 'fields' ? ['Timestamp'] : []}
      excludeFields={withDate ? ['updated_at'] : undefined}
      validationStatus="valid"
      onChange={onSave}
    />
  );
});
