import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import {
  adaptAstNodeViewModel,
  type AstNodeViewModel,
} from '@app-builder/models/ast-node-view-model';
import {
  useGetAstNodeOption,
  useTimestampFieldOptions,
} from '@app-builder/services/editor/options';
import { getValidationStatus } from '@app-builder/services/validation/ast-node-validation';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Operand } from '../Operand/Operand';

export function TimestampField({
  onChange,
  astNodeVM,
}: {
  onChange: (value: AstNodeViewModel) => void;
  astNodeVM: AstNodeViewModel;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const options = useTimestampFieldOptions();
  const getAstNodeOption = useGetAstNodeOption();

  const onSave = React.useCallback(
    (newSelection: AstNode) => {
      const newNode = newSelection ?? NewUndefinedAstNode();
      onChange(adaptAstNodeViewModel({ ast: newNode }));
    },
    [onChange],
  );

  const operandProps = React.useMemo(() => {
    return {
      ...getAstNodeOption(astNodeVM),
      validationStatus: getValidationStatus(astNodeVM),
    };
  }, [astNodeVM, getAstNodeOption]);

  return (
    <Operand
      placeholder={t('scenarios:edit_date.select_a_field')}
      onSave={onSave}
      options={options}
      {...operandProps}
    />
  );
}
