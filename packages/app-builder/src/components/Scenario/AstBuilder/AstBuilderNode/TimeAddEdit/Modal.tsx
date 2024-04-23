import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import {
  type AstNode,
  NewConstantAstNode,
  NewTimeAddAstNode,
  NewUndefinedAstNode,
  type TimeAddAstNode,
  timeAddAstNodeName,
  type TimestampFieldAstNode,
} from '@app-builder/models';
import {
  isTimeAddOperator,
  type TimeAddOperator,
  timeAddOperators,
} from '@app-builder/models/editable-operators';
import {
  computeValidationForNamedChildren,
  type EvaluationError,
} from '@app-builder/models/node-evaluation';
import {
  adaptAstNodeFromEditorViewModel,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { CopyPasteASTContextProvider } from '@app-builder/services/editor/copy-paste-ast';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Temporal } from 'temporal-polyfill';
import { Button, Input, ModalV2 } from 'ui-design-system';

import { Operator } from '../Operator';
import { type DurationUnit, DurationUnitSelect } from './DurationUnitSelect';
import { TimestampField } from './TimestampField';

export interface TimeAddViewModal {
  nodeId: string;
  timestampField: EditorNodeViewModel | null;
  sign: TimeAddOperator;
  duration: string;
  durationUnit: DurationUnit;
  errors: {
    timestampField: EvaluationError[];
    sign: EvaluationError[];
    duration: EvaluationError[];
  };
}

export const isTimeAddEditorNodeViewModel = (
  vm: EditorNodeViewModel,
): vm is TimeAddEditorNodeViewModel => {
  return vm.funcName === timeAddAstNodeName;
};

export type TimeAddEditorNodeViewModel = {
  nodeId: string;
  funcName: string | null;
  constant: string;
  errors: EvaluationError[];
  children: TimeAddEditorNodeViewModel[];
  namedChildren: Record<string, TimeAddEditorNodeViewModel>;
  parent: TimeAddEditorNodeViewModel;
};

export const defaultISO8601Duration = 'PT0S';
export const adaptTimeAddViewModal = (
  vm: TimeAddEditorNodeViewModel,
): TimeAddViewModal => {
  const iso8601Duration =
    vm.namedChildren['duration']?.constant !== ''
      ? vm.namedChildren['duration']?.constant
      : defaultISO8601Duration;
  const temporalDuration =
    Temporal.Duration.from(iso8601Duration).round('seconds');
  const { duration, durationUnit } =
    adaptDurationAndUnitFromTemporalDuration(temporalDuration);

  const sign = isTimeAddOperator(vm.namedChildren['sign']?.constant)
    ? vm.namedChildren['sign']?.constant
    : '+';

  return {
    nodeId: vm.nodeId,
    timestampField: vm.namedChildren['timestampField'],
    sign,
    duration: duration.toString(),
    durationUnit,
    errors: {
      timestampField: computeValidationForNamedChildren(vm, 'timestampField'),
      sign: computeValidationForNamedChildren(vm, 'sign'),
      duration: computeValidationForNamedChildren(vm, 'duration'),
    },
  };
};

const adaptTimeAddAstNode = (
  timeAddViewModel: TimeAddViewModal,
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
    durationAstNode,
  );
};

export interface TimeAddEditModalProps {
  initialValue: TimeAddViewModal;
  onSave: (astNode: AstNode) => void;
}

const TimeAddEditModalContext =
  createSimpleContext<(timeAddProps: TimeAddEditModalProps) => void>(
    'TimeAddEditModal',
  );

export const useEditTimeAdd = TimeAddEditModalContext.useValue;

export function TimeAddEditModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<boolean>(false);
  const [timeAddEditModalProps, setValueEditModalProps] =
    useState<TimeAddEditModalProps>();

  const editTimeAdd = useCallback((dateProps: TimeAddEditModalProps) => {
    setValueEditModalProps(dateProps);
    setOpen(true);
  }, []);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <TimeAddEditModalContext.Provider value={editTimeAdd}>
        {children}
        <ModalV2.Content>
          {/* New context necessary, hack to prevent pasting unwanted astnode inside the modal (ex: I close the modal, copy the current node, open the modal and paste the current inside the current...) */}
          <CopyPasteASTContextProvider>
            {timeAddEditModalProps ? (
              <TimeAddEditModalContent
                initialValue={timeAddEditModalProps.initialValue}
                onSave={(astNode: AstNode) => {
                  timeAddEditModalProps.onSave(astNode);
                  setOpen(false);
                }}
              />
            ) : null}
          </CopyPasteASTContextProvider>
        </ModalV2.Content>
      </TimeAddEditModalContext.Provider>
    </ModalV2.Root>
  );
}

function TimeAddEditModalContent({
  initialValue,
  onSave,
}: {
  initialValue: TimeAddViewModal;
  onSave: (astNode: AstNode) => void;
}) {
  const { t } = useTranslation(['scenarios', 'common']);
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();
  const [value, setValue] = useState<TimeAddViewModal>(() => initialValue);

  const handleSave = () => {
    onSave(adaptTimeAddAstNode(value));
  };

  return (
    <>
      <ModalV2.Title>{t('scenarios:edit_date.title')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <div className="flex gap-2 pb-2">
            <TimestampField
              value={value.timestampField}
              onChange={(timestampField) =>
                setValue({
                  ...value,
                  timestampField,
                  errors: {
                    ...value.errors,
                    timestampField: [],
                  },
                })
              }
              errors={value.errors.timestampField}
              className="grow"
            />
            <Operator
              operators={timeAddOperators}
              value={value.sign}
              setValue={(sign) =>
                setValue({
                  ...value,
                  sign,
                  errors: {
                    ...value.errors,
                    sign: [],
                  },
                })
              }
              errors={value.errors.sign}
            />
            <Input
              value={value.duration ?? undefined}
              onChange={(e) =>
                setValue({
                  ...value,
                  duration: e.target.value,
                  errors: {
                    ...value.errors,
                    duration: [],
                  },
                })
              }
              borderColor={
                value.errors.duration.length > 0 ? 'red-100' : 'grey-10'
              }
              min="0"
              placeholder="0"
              type="number"
              className="basis-[60px]"
            />
            <DurationUnitSelect
              value={value.durationUnit}
              onChange={(durationUnit) => setValue({ ...value, durationUnit })}
            />
          </div>
          <EvaluationErrors
            errors={adaptEvaluationErrorViewModels([
              ...value.errors.timestampField,
              ...value.errors.sign,
              ...value.errors.duration,
            ]).map(getNodeEvaluationErrorMessage)}
          />
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close
            render={
              <Button className="flex-1" variant="secondary" name="cancel" />
            }
          >
            {t('common:cancel')}
          </ModalV2.Close>
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
}

const adaptDurationAndUnitFromTemporalDuration = (
  temporalDuration: Temporal.Duration,
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
