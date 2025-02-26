import { type AstNode } from '@app-builder/models';
import { useGetAstNodeOperandProps, useOperandOptions } from '@app-builder/services/editor/options';
import {
  type AstNodeErrors,
  type ValidationStatus,
} from '@app-builder/services/validation/ast-node-validation';
import { useMemo } from 'react';

import { Operand } from '../../../Operand';

export type VariableOperandProps = {
  astNode: AstNode;
  astNodeErrors: AstNodeErrors | undefined;
  validationStatus: ValidationStatus;
  onChange: (node: AstNode) => void;
};

export const VariableOperand = ({
  astNode,
  astNodeErrors,
  validationStatus,
  onChange,
}: VariableOperandProps) => {
  const options = useOperandOptions([]);
  const leftOptions = useMemo(
    () =>
      options.filter(
        (option) =>
          option.dataType === 'String' || option.dataType === 'Int' || option.dataType === 'Float',
      ),
    [options],
  );

  const getAstNodeOperandProps = useGetAstNodeOperandProps();
  const astNodeOperandProps = useMemo(
    () => getAstNodeOperandProps(astNode),
    [astNode, getAstNodeOperandProps],
  );

  return (
    <Operand
      onSave={onChange}
      options={leftOptions}
      astNodeErrors={astNodeErrors}
      validationStatus={validationStatus}
      {...astNodeOperandProps}
    />
  );
};
