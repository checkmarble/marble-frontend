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
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Operand } from '../../../Operand';

export function RightOperand({
  onChange,
  astNode,
  astNodeErrors,
  validationStatus,
}: {
  onChange: (astNode: AstNode) => void;
  astNode: AstNode;
  astNodeErrors?: AstNodeErrors;
  validationStatus: ValidationStatus;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const options = useOperandOptions([]);
  const rightOptions = React.useMemo(
    () =>
      options.filter(
        (option) =>
          option.operandType === 'CustomList' ||
          option.dataType === 'String[]' ||
          option.dataType === 'String',
      ),
    [options],
  );

  const defaultCoerceToConstant = useDefaultCoerceToConstant();
  const coerceToConstant = React.useCallback(
    (searchValue: string) =>
      defaultCoerceToConstant(searchValue).filter(
        (option) =>
          option.dataType === 'String[]' || option.dataType === 'String',
      ),
    [defaultCoerceToConstant],
  );

  const getAstNodeOperandProps = useGetAstNodeOperandProps();
  const astNodeOperandProps = React.useMemo(() => {
    return getAstNodeOperandProps(astNode);
  }, [astNode, getAstNodeOperandProps]);

  return (
    <Operand
      placeholder={t(
        'scenarios:edit_operand.data_type.string.field_placeholder',
      )}
      onSave={onChange}
      options={rightOptions}
      coerceToConstant={coerceToConstant}
      validationStatus={validationStatus}
      astNodeErrors={astNodeErrors}
      {...astNodeOperandProps}
    />
  );
}
