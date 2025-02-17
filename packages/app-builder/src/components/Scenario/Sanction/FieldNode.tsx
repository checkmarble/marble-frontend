import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import { hasSubObject } from 'remeda';

import { MatchOperand } from './MatchOperand';

export const FieldNode = ({
  value,
  placeholder,
  viewOnly,
  onChange,
  onBlur,
}: {
  value?: AstNode;
  onChange?: (value?: AstNode) => void;
  onBlur?: () => void;
  placeholder?: string;
  viewOnly?: boolean;
}) => (
  <div onBlur={onBlur}>
    <MatchOperand
      viewOnly={viewOnly}
      node={value ?? NewUndefinedAstNode()}
      placeholder={placeholder}
      onSave={(node) => {
        onChange?.(
          hasSubObject(NewUndefinedAstNode() as AstNode, node)
            ? undefined
            : node,
        );
      }}
    />
  </div>
);
