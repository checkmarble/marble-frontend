import { type AstNode } from '@app-builder/models';
import {
  useDefaultCoerceToConstant,
  useGetAstNodeOperandProps,
  useOperandOptions,
} from '@app-builder/services/editor/options';
import {
  type AstNodeErrors,
  type ValidationStatus,
} from '@app-builder/services/validation/ast-node-validation';
import { useCallback, useMemo } from 'react';

import { Operand } from '../../../Operand';

export type LeftOperandProps = {
  astNode: AstNode;
  astNodeErrors: AstNodeErrors | undefined;
  validationStatus: ValidationStatus;
  onChange: (node: AstNode) => void;
};

export const LeftOperand = ({
  astNode,
  astNodeErrors,
  validationStatus,
  onChange,
}: LeftOperandProps) => {
  const options = useOperandOptions([]);
  const leftOptions = useMemo(
    () =>
      options.filter(
        (option) => option.dataType === 'Int' || option.dataType === 'Float',
      ),
    [options],
  );

  const defaultCoerceToConstant = useDefaultCoerceToConstant();
  const coerceToConstant = useCallback(
    (searchValue: string) =>
      defaultCoerceToConstant(searchValue).filter(
        (option) => option.dataType === 'Int',
      ),
    [defaultCoerceToConstant],
  );

  const getAstNodeOperandProps = useGetAstNodeOperandProps();
  const astNodeOperandProps = useMemo(() => {
    return getAstNodeOperandProps(astNode);
  }, [astNode, getAstNodeOperandProps]);

  return (
    <Operand
      onSave={onChange}
      options={leftOptions}
      coerceToConstant={coerceToConstant}
      astNodeErrors={astNodeErrors}
      validationStatus={validationStatus}
      {...astNodeOperandProps}
    />
  );
};
