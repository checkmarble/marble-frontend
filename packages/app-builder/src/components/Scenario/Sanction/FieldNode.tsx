import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';

import { MatchOperand } from './MatchOperand';

export const FieldNode = ({
  value,
  placeholder,
  onChange,
  onBlur,
}: {
  value?: AstNode;
  onChange?: (value: AstNode) => void;
  onBlur?: () => void;
  placeholder?: string;
}) => (
  <div onBlur={onBlur}>
    <MatchOperand
      node={value ?? NewUndefinedAstNode()}
      placeholder={placeholder}
      onSave={(node) => {
        // if (ref.current) {
        //   ref.current.value = JSON.stringify(node);
        //   ref.current?.dispatchEvent(new Event('change'));
        // }
        onChange?.(node);
      }}
    />
  </div>
);
