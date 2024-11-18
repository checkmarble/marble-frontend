import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import {
  type AstNode,
  NewConstantAstNode,
  NewTimeAddAstNode,
  type TimeAddAstNode,
  type TimestampFieldAstNode,
} from '@app-builder/models';
import {
  isTimeAddOperator,
  type TimeAddOperator,
  timeAddOperators,
} from '@app-builder/models/editable-operators';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import { dateDocHref } from '@app-builder/services/documentation-href';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import {
  type AstNodeErrors,
  computeValidationForNamedChildren,
} from '@app-builder/services/validation/ast-node-validation';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Temporal } from 'temporal-polyfill';
import { Button, Input, ModalV2 } from 'ui-design-system';

import { Operator } from '../../../../Operator';
import { type DurationUnit, DurationUnitSelect } from './DurationUnitSelect';
import { TimestampField } from './TimestampField';

export interface TimeAddViewModel {
  timestampField: {
    astNode: TimestampFieldAstNode;
    astNodeErrors?: AstNodeErrors;
  };
  sign: TimeAddOperator;
  duration: string;
  durationUnit: DurationUnit;
  errors: {
    timestampField: EvaluationError[];
    sign: EvaluationError[];
    duration: EvaluationError[];
  };
}

export const defaultISO8601Duration = 'PT0S';
export function adaptTimeAddViewModal(
  timeAddAstNode: TimeAddAstNode,
  astNodeErrors: AstNodeErrors,
): TimeAddViewModel {
  const iso8601Duration =
    timeAddAstNode.namedChildren.duration.constant !== ''
      ? timeAddAstNode.namedChildren.duration.constant
      : defaultISO8601Duration;
  const temporalDuration =
    Temporal.Duration.from(iso8601Duration).round('seconds');
  const { duration, durationUnit } =
    adaptDurationAndUnitFromTemporalDuration(temporalDuration);

  const sign = isTimeAddOperator(timeAddAstNode.namedChildren.sign.constant)
    ? timeAddAstNode.namedChildren.sign.constant
    : '+';

  return {
    timestampField: {
      astNode: timeAddAstNode.namedChildren.timestampField,
      astNodeErrors: astNodeErrors.namedChildren['timestampField'],
    },
    sign,
    duration: duration.toString(),
    durationUnit,
    errors: {
      timestampField: computeValidationForNamedChildren(
        timeAddAstNode,
        astNodeErrors,
        'timestampField',
      ),
      sign: computeValidationForNamedChildren(
        timeAddAstNode,
        astNodeErrors,
        'sign',
      ),
      duration: computeValidationForNamedChildren(
        timeAddAstNode,
        astNodeErrors,
        'duration',
      ),
    },
  };
}

function adaptTimeAddAstNode(
  timeAddViewModel: TimeAddViewModel,
): TimeAddAstNode {
  const signAstNode = NewConstantAstNode({
    constant: timeAddViewModel.sign,
  });
  const temporalDuration = Temporal.Duration.from({
    [timeAddViewModel.durationUnit]: parseInt(timeAddViewModel.duration),
  });
  const durationAstNode = NewConstantAstNode({
    constant: temporalDuration.toString(),
  });

  return NewTimeAddAstNode(
    timeAddViewModel.timestampField.astNode,
    signAstNode,
    durationAstNode,
  );
}

export function TimeAddEdit({
  timeAddAstNode,
  astNodeErrors,
  onSave,
}: {
  timeAddAstNode: TimeAddAstNode;
  astNodeErrors: AstNodeErrors;
  onSave: (astNode: AstNode) => void;
}) {
  const { t } = useTranslation(['scenarios', 'common']);
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();
  const [value, setValue] = React.useState<TimeAddViewModel>(() =>
    adaptTimeAddViewModal(timeAddAstNode, astNodeErrors),
  );

  const handleSave = () => {
    onSave(adaptTimeAddAstNode(value));
  };

  return (
    <>
      <ModalV2.Title>{t('scenarios:edit_date.title')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <Callout variant="outlined">
          <ModalV2.Description className="whitespace-pre text-wrap">
            <Trans
              t={t}
              i18nKey="scenarios:edit_date.description"
              components={{
                DocLink: <ExternalLink href={dateDocHref} />,
              }}
            />
          </ModalV2.Description>
        </Callout>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <TimestampField
              astNode={value.timestampField.astNode}
              astNodeErrors={value.timestampField.astNodeErrors}
              onChange={(timestampField) =>
                setValue({
                  ...value,
                  timestampField: {
                    astNode: timestampField,
                    astNodeErrors: {
                      errors: [],
                      children: [],
                      namedChildren: {},
                    },
                  },
                  errors: {
                    ...value.errors,
                    timestampField: [],
                  },
                })
              }
              validationStatus={
                value.errors.timestampField.length > 0 ? 'error' : 'valid'
              }
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
              validationStatus={
                value.errors.sign.length > 0 ? 'error' : 'valid'
              }
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
