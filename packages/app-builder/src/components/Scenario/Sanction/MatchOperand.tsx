import { type AstNode } from '@app-builder/models';
import {
  useGetAstNodeOperandProps,
  useOperandOptions,
} from '@app-builder/services/editor/options';

import { Operand } from '../AstBuilder/AstBuilderNode/Operand';

export const MatchOperand = ({
  node,
  onSave,
  placeholder,
}: {
  node: AstNode;
  onSave?: (astNode: AstNode) => void;
  placeholder?: string;
}) => {
  const getOperandAstNodeOperandProps = useGetAstNodeOperandProps();
  const options = useOperandOptions();

  return (
    <Operand
      {...getOperandAstNodeOperandProps(node)}
      placeholder={placeholder}
      options={options.filter((o) => o.dataType === 'String')}
      validationStatus="valid"
      onSave={onSave}
    />
  );
};
