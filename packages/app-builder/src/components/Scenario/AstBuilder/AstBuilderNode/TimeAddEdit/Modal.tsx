import {
  type AstNode,
  computeValidationForNamedChildren,
  isValidationFailure,
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
import { Temporal } from 'temporal-polyfill';

import { ErrorMessage } from '../../ErrorMessage';
import { getBorderColor } from '../../utils';
import { type DurationUnit, DurationUnitSelect } from './DurationUnitSelect';
import { PlusMinusSelect, type PlusOrMinus } from './PlusMinusSelect';
import { TimestampField } from './TimestampField';

export interface TimeAddViewModal {
  nodeId: string;
  timestampField: EditorNodeViewModel | null;
  sign: PlusOrMinus;
  duration: string;
  durationUnit: DurationUnit;
  validation: {
    timestampField: Validation;
    sign: Validation;
    duration: Validation;
    durationUnit: Validation;
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

export const defaultISO8601Duration = 'PT0S';
export const adaptTimeAddViewModal = (
  vm: TimeAddEditorNodeViewModel
): TimeAddViewModal => {
  const iso8601Duration =
    vm.namedChildren['duration']?.constant !== ''
      ? vm.namedChildren['duration']?.constant
      : defaultISO8601Duration;
  const temporalDuration =
    Temporal.Duration.from(iso8601Duration).round('seconds');
  const { duration, durationUnit } =
    adaptDurationAndUnitFromTemporalDuration(temporalDuration);

  const sign = (
    vm.namedChildren['sign']?.constant !== ''
      ? vm.namedChildren['sign']?.constant
      : '+'
  ) as PlusOrMinus;

  return {
    nodeId: vm.nodeId,
    timestampField: vm.namedChildren['timestampField'],
    sign,
    duration: duration.toString(),
    durationUnit,
    validation: {
      timestampField: computeValidationForNamedChildren(vm, 'timestampField'),
      sign: computeValidationForNamedChildren(vm, 'sign'),
      duration: computeValidationForNamedChildren(vm, 'duration'),
      durationUnit: computeValidationForNamedChildren(vm, 'durationUnit'),
    },
  };
};

const adaptTimeAddAstNode = (
  timeAddViewModel: TimeAddViewModal
): TimeAddAstNode => {
  const timestampFieldAstNode = timeAddViewModel.timestampField
    ? adaptAstNodeFromEditorViewModel(timeAddViewModel.timestampField)
    : NewUndefinedAstNode();
  const signAstNode = NewConstantAstNode({
    constant: timeAddViewModel.sign,
  });
  const temporalDuration = adaptTemporalDurationFromDurationAndUnit({
    duration: parseInt(timeAddViewModel.duration),
    durationUnit: timeAddViewModel.durationUnit,
  });
  const durationAstNode = NewConstantAstNode({
    constant: temporalDuration.toString(),
  });

  return NewTimeAddAstNode(
    timestampFieldAstNode as TimestampFieldAstNode,
    signAstNode,
    durationAstNode
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
              value={value.sign}
              onChange={(sign) =>
                setValue({
                  ...value,
                  sign,
                  validation: {
                    ...value.validation,
                    sign: NewPendingValidation(),
                  },
                })
              }
              validation={value.validation.sign}
            />
            <Input
              value={value.duration ?? undefined}
              onChange={(e) =>
                setValue({
                  ...value,
                  duration: e.target.value,
                  validation: {
                    ...value.validation,
                    duration: NewPendingValidation(),
                  },
                })
              }
              borderColor={getBorderColor(value.validation.duration)}
              min="0"
              placeholder="0"
              type="number"
              className="basis-[60px]"
            />
            <DurationUnitSelect
              value={value.durationUnit}
              onChange={(durationUnit) => setValue({ ...value, durationUnit })}
              validation={value.validation.durationUnit}
            />
          </div>
          {isValidationFailure(value.validation.timestampField) && (
            <ErrorMessage errors={value.validation.timestampField?.errors} />
          )}
          {isValidationFailure(value.validation.sign) && (
            <ErrorMessage errors={value.validation.sign.errors} />
          )}
          {isValidationFailure(value.validation.duration) && (
            <ErrorMessage errors={value.validation.duration.errors} />
          )}
          {isValidationFailure(value.validation.durationUnit) && (
            <ErrorMessage errors={value.validation.durationUnit.errors} />
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

const adaptDurationAndUnitFromTemporalDuration = (
  temporalDuration: Temporal.Duration
): { duration: number; durationUnit: DurationUnit } => {
  if (temporalDuration.seconds > 0) {
    return {
      duration: temporalDuration.total('second'),
      durationUnit: 'seconds',
    };
  } else if (temporalDuration.minutes > 0) {
    return {
      duration: temporalDuration.total('minute'),
      durationUnit: 'minutes',
    };
  } else if (temporalDuration.hours > 0) {
    return {
      duration: temporalDuration.total('hour'),
      durationUnit: 'hours',
    };
  }
  return {
    duration: temporalDuration.total('day'),
    durationUnit: 'days',
  };
};

const adaptTemporalDurationFromDurationAndUnit = ({
  duration,
  durationUnit,
}: {
  duration: number;
  durationUnit: DurationUnit;
}): Temporal.Duration => {
  return Temporal.Duration.from({ [durationUnit]: duration });
};
