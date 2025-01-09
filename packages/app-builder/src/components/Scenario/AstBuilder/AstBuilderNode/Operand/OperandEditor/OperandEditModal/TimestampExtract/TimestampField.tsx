import {
  type AstNode,
  isTimestampFieldAstNode,
  type TimestampFieldAstNode,
} from '@app-builder/models';
import {
  useDefaultCoerceToConstant,
  useGetAstNodeOperandProps,
  useTimestampFieldOptions,
} from '@app-builder/services/editor/options';
import {
  type AstNodeErrors,
  type ValidationStatus,
} from '@app-builder/services/validation/ast-node-validation';
import * as React from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { Operand } from '../../../Operand';

export function TimestampField({
  onChange,
  astNode,
  astNodeErrors,
  validationStatus,
}: {
  onChange: (value: TimestampFieldAstNode) => void;
  astNode: TimestampFieldAstNode;
  astNodeErrors?: AstNodeErrors;
  validationStatus: ValidationStatus;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const options = useTimestampFieldOptions();
  const defaultCoerceToConstant = useDefaultCoerceToConstant();
  const coerceToConstant = React.useCallback(
    (searchValue: string) =>
      defaultCoerceToConstant(searchValue).filter(
        ({ dataType }) => dataType === 'Timestamp',
      ),
    [defaultCoerceToConstant],
  );

  const onSave = React.useCallback(
    (newSelection: AstNode) => {
      // Safeguard; should never happen and does not protect against every possible case (ex: if the astNode is not a Timestamp data type)
      // Possible upgrade: add a validation on the operand data type (same condition than the one used inside useTimestampFieldOptions)
      if (!isTimestampFieldAstNode(newSelection)) {
        toast.error(t('scenarios:edit_date.field_is_not_supported'));
        return;
      }
      onChange(newSelection);
    },
    [onChange, t],
  );

  const getAstNodeOperandProps = useGetAstNodeOperandProps();
  const astNodeOperandProps = React.useMemo(() => {
    return getAstNodeOperandProps(astNode);
  }, [astNode, getAstNodeOperandProps]);

  return (
    <Operand
      placeholder={t('scenarios:edit_date.select_a_field')}
      onSave={onSave}
      options={options}
      coerceToConstant={coerceToConstant}
      validationStatus={validationStatus}
      astNodeErrors={astNodeErrors}
      {...astNodeOperandProps}
    />
  );
}
