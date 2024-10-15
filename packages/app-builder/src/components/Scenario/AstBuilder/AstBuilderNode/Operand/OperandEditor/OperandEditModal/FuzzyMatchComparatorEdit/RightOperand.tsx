import { type AstNode } from '@app-builder/models';
import { type AstNodeViewModel } from '@app-builder/models/ast-node-view-model';
import {
  useDefaultCoerceToConstant,
  useGetAstNodeOption,
  useOperandOptions,
} from '@app-builder/services/editor/options';
import { type ValidationStatus } from '@app-builder/services/validation/ast-node-validation';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Operand } from '../../../Operand';

export function RightOperand({
  onChange,
  right,
  validationStatus,
}: {
  onChange: (astNode: AstNode) => void;
  right: AstNodeViewModel;
  validationStatus: ValidationStatus;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const options = useOperandOptions(right);
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

  const getAstNodeOption = useGetAstNodeOption();

  const operandProps = React.useMemo(
    () => getAstNodeOption(right),
    [right, getAstNodeOption],
  );

  return (
    <Operand
      placeholder={t('scenarios:edit_date.select_a_field')}
      onSave={onChange}
      options={rightOptions}
      coerceToConstant={coerceToConstant}
      validationStatus={validationStatus}
      {...operandProps}
    />
  );
}
