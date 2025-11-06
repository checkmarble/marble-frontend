import { isUndefinedAstNode } from '@app-builder/models';
import { isKnownOperandAstNode, type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';

import { MatchOperand } from './MatchOperand';

export const FieldNode = ({
  value,
  placeholder,
  onChange,
  onBlur,
}: {
  value?: KnownOperandAstNode;
  onChange?: (value: KnownOperandAstNode | null) => void;
  onBlur?: () => void;
  placeholder?: string;
}) => (
  <div onBlur={onBlur}>
    <MatchOperand
      node={value}
      placeholder={placeholder}
      onSave={(node) => {
        if (isKnownOperandAstNode(node)) {
          onChange?.(!isUndefinedAstNode(node) ? node : null);
        }
      }}
    />
  </div>
);
