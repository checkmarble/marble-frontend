import {
  type AstNode,
  type EvaluationError,
  isValidationFailure,
  mergeValidations,
  NewConstantAstNode,
  NewPendingValidation,
  NewTimeAddAstNode,
  NewUndefinedAstNode,
  type TimeAddAstNode,
  timeAddAstNodeName,
  type TimestampFieldAstNode,
  type Validation,
} from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { Button, Input, Modal } from '@ui-design-system';
import { type PropsWithChildren, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorMessage } from '../../ErrorMessage';
import { getBorderColor } from '../../utils';
import { type IntervalUnit, IntervalUnitSelect } from './IntervalUnitSelect';
import { PlusMinusSelect, type PlusOrMinus } from './PlusMinusSelect';
import { TimestampField } from './TimestampField';

export interface TimeAddViewModal {
  nodeId: string;
  timestampField: EditorNodeViewModel | null;
  operator: PlusOrMinus;
  interval: string;
  intervalUnit: IntervalUnit;
  validation: {
    timestampField: Validation;
    interval: Validation;
  };
}

export const isTimeAddEditorNodeViewModel = (
  vm: EditorNodeViewModel
): vm is TimeAddEditorNodeViewModel => {
  return vm.funcName === timeAddAstNodeName;
};

export type TimeAddEditorNodeViewModel = {
  nodeId: string;
  funcName: string | null;
  constant: string;
  validation: Validation;
  children: TimeAddEditorNodeViewModel[];
  namedChildren: Record<string, TimeAddEditorNodeViewModel>;
};

export const adaptTimeAddViewModal = (
  vm: TimeAddEditorNodeViewModel
): TimeAddViewModal => {
  const { operator, interval, intervalUnit } = parseIntervalAstNode(
    vm.children[1]
  );

  return {
    nodeId: vm.nodeId,
    timestampField: vm.children[0],
    operator,
    interval,
    intervalUnit,
    validation: {
      timestampField: computeValidationForChildren(vm, 0),
      interval: computeValidationForChildren(vm, 1),
    },
  };
};

const computeValidationForChildren = (
  vm: TimeAddEditorNodeViewModel,
  index: number
): Validation =>
  mergeValidations([
    vm.children[index]?.validation ?? NewPendingValidation(),
    parentValidationForChildren(vm, index),
  ]);

const parentValidationForChildren = (
  vm: TimeAddEditorNodeViewModel,
  index: number
): Validation => {
  if (vm.validation.state !== 'fail') return { state: vm.validation.state };

  const childErrors: EvaluationError[] = vm.validation.errors.filter(
    (error) => error.argumentIndex == index
  );
  if (childErrors.length > 0) return { state: 'fail', errors: childErrors };
  return { state: 'pending' };
};

const parseIntervalAstNode = (vm: TimeAddEditorNodeViewModel) => {
  const intervalString = vm.constant;
  if (intervalString === '')
    return {
      operator: '+' as PlusOrMinus,
      interval: '0',
      intervalUnit: 's' as IntervalUnit,
    };

  const operator =
    intervalString.slice(0, 1) === '-' ? '-' : ('+' as PlusOrMinus);
  const interval = intervalString.slice(1, -1);
  const intervalUnit = intervalString.slice(-1) as IntervalUnit;

  return { operator, interval, intervalUnit };
};

const adaptTimeAddAstNode = (
  timeAddViewModel: TimeAddViewModal
): TimeAddAstNode => {
  const timestampFieldAstNode = timeAddViewModel.timestampField
    ? adaptAstNodeFromEditorViewModel(timeAddViewModel.timestampField)
    : NewUndefinedAstNode();
  const intervalAstNode = NewConstantAstNode({
    constant:
      timeAddViewModel.operator +
      timeAddViewModel.interval +
      timeAddViewModel.intervalUnit,
  });

  return NewTimeAddAstNode(
    timestampFieldAstNode as TimestampFieldAstNode,
    intervalAstNode
  );
};

export interface TimeAddEditModalProps {
  initialValue: TimeAddViewModal;
  onSave: (astNode: AstNode) => void;
}

const TimeAddEditModalContext =
  createSimpleContext<(timeAddProps: TimeAddEditModalProps) => void>(
    'TimeAddEditModal'
  );

export const useEditTimeAdd = TimeAddEditModalContext.useValue;

export const TimeAddEditModal = ({
  builder,
  children,
}: PropsWithChildren<{ builder: AstBuilder }>) => {
  const [open, onOpenChange] = useState<boolean>(false);
  const [timeAddEditModalProps, setValueEditModalProps] =
    useState<TimeAddEditModalProps>();

  const editTimeAdd = useCallback((dateProps: TimeAddEditModalProps) => {
    setValueEditModalProps(dateProps);
    onOpenChange(true);
  }, []);

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <TimeAddEditModalContext.Provider value={editTimeAdd}>
        {children}
        <Modal.Content>
          {timeAddEditModalProps && (
            <TimeAddEditModalContent
              builder={builder}
              initialValue={timeAddEditModalProps.initialValue}
              onSave={(astNode: AstNode) => {
                timeAddEditModalProps.onSave(astNode);
                onOpenChange(false);
              }}
            />
          )}
        </Modal.Content>
      </TimeAddEditModalContext.Provider>
    </Modal.Root>
  );
};

const TimeAddEditModalContent = ({
  builder,
  initialValue,
  onSave,
}: {
  builder: AstBuilder;
  initialValue: TimeAddViewModal;
  onSave: (astNode: AstNode) => void;
}) => {
  const { t } = useTranslation(['scenarios', 'common']);
  const [value, setValue] = useState<TimeAddViewModal>(() => initialValue);

  const handleSave = () => {
    onSave(adaptTimeAddAstNode(value));
  };
  return (
    <>
      <Modal.Title>{t('scenarios:edit_date.title')}</Modal.Title>
      <div className="bg-grey-00 flex flex-col gap-8 p-8">
        <div>
          <div className="flex gap-2 pb-2">
            <TimestampField
              builder={builder}
              value={value.timestampField}
              onChange={(timestampField) =>
                setValue({
                  ...value,
                  timestampField,
                  validation: {
                    ...value.validation,
                    timestampField: NewPendingValidation(),
                  },
                })
              }
              validation={value.validation.timestampField}
              className="flex-grow"
            />
            <PlusMinusSelect
              value={value.operator}
              onChange={(operator) => setValue({ ...value, operator })}
            />
            <Input
              value={value.interval ?? undefined}
              onChange={(e) =>
                setValue({
                  ...value,
                  interval: e.target.value,
                  validation: {
                    ...value.validation,
                    interval: NewPendingValidation(),
                  },
                })
              }
              borderColor={getBorderColor(value.validation.interval)}
              min="0"
              placeholder="0"
              type="number"
              className="basis-[60px]"
            />
            <IntervalUnitSelect
              value={value.intervalUnit}
              onChange={(intervalUnit) => setValue({ ...value, intervalUnit })}
            />
          </div>
          {isValidationFailure(value.validation.timestampField) && (
            <ErrorMessage errors={value.validation.timestampField?.errors} />
          )}
          {isValidationFailure(value.validation.interval) && (
            <ErrorMessage errors={value.validation.interval.errors} />
          )}
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            className="flex-1"
            variant="primary"
            name="save"
            onClick={() => handleSave()}
          >
            {t('common:save')}
          </Button>
        </div>
      </div>
    </>
  );
};
