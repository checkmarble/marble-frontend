import { type AstNode } from '@app-builder/models';
import {
  useDefaultCoerceToConstant,
  useGetAstNodeOption,
  useOperandOptions,
} from '@app-builder/services/editor/options';
import {
  type AstNodeErrors,
  type ValidationStatus,
} from '@app-builder/services/validation/ast-node-validation';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Operand } from '../../../Operand';

export function LeftOperand({
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
  const leftOptions = React.useMemo(
    () => options.filter((option) => option.dataType === 'String'),
    [options],
  );

  const defaultCoerceToConstant = useDefaultCoerceToConstant();
  const coerceToConstant = React.useCallback(
    (searchValue: string) =>
      defaultCoerceToConstant(searchValue).filter(
        (option) => option.dataType === 'String',
      ),
    [defaultCoerceToConstant],
  );

  const getAstNodeOption = useGetAstNodeOption();

  const operandProps = React.useMemo(
    () => getAstNodeOption(astNode),
    [astNode, getAstNodeOption],
  );

  return (
    <Operand
      placeholder={t('scenarios:edit_date.select_a_field')}
      onSave={onChange}
      options={leftOptions}
      coerceToConstant={coerceToConstant}
      validationStatus={validationStatus}
      astNodeErrors={astNodeErrors}
      {...operandProps}
    />
  );
}
