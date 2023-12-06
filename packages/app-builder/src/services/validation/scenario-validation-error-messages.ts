import { type EvaluationError } from '@app-builder/models';
import { type TFunction } from 'i18next';
import { type ScenarioValidationErrorCodeDto } from 'marble-api';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { assertNever } from 'typescript-utils';

// Edit this type to handle contextual data for each error code
export type EvaluationErrorViewModel =
  | {
      error: 'UNEXPECTED_ERROR';
      message: string;
    }
  | {
      error:
        | 'UNDEFINED_FUNCTION'
        | 'MISSING_NAMED_ARGUMENT'
        | 'ARGUMENTS_MUST_BE_INT_OR_FLOAT'
        | 'ARGUMENTS_MUST_BE_INT_FLOAT_OR_TIME'
        | 'ARGUMENT_MUST_BE_INTEGER'
        | 'ARGUMENT_MUST_BE_STRING'
        | 'ARGUMENT_MUST_BE_BOOLEAN'
        | 'ARGUMENT_MUST_BE_LIST'
        | 'ARGUMENT_MUST_BE_CONVERTIBLE_TO_DURATION'
        | 'ARGUMENT_MUST_BE_TIME'
        | 'FUNCTION_ERROR'
        | 'ARGUMENT_INVALID_TYPE'
        | 'LIST_NOT_FOUND'
        | 'FIELD_NOT_FOUND'
        | 'ARGUMENT_REQUIRED';
      count: number;
    }
  | {
      error: 'WRONG_NUMBER_OF_ARGUMENTS';
    };

export function adaptEvaluationErrorViewModels(
  evaluationErrors: EvaluationError[],
): EvaluationErrorViewModel[] {
  const {
    UNEXPECTED_ERROR,
    WRONG_NUMBER_OF_ARGUMENTS,
    DATABASE_ACCESS_NOT_FOUND,
    PAYLOAD_FIELD_NOT_FOUND,
    ...expectedErrors
  } = R.groupBy.strict(evaluationErrors, ({ error }) => error);

  const evaluationErrorVMs: EvaluationErrorViewModel[] = [];

  if (UNEXPECTED_ERROR) {
    const unexpectedErrorVMs = R.pipe(
      UNEXPECTED_ERROR,
      R.map((error) => ({
        error: 'UNEXPECTED_ERROR' as const,
        message: error.message,
      })),
    );

    evaluationErrorVMs.push(...unexpectedErrorVMs);
  }

  if (WRONG_NUMBER_OF_ARGUMENTS) {
    evaluationErrorVMs.push({
      error: 'WRONG_NUMBER_OF_ARGUMENTS',
    });
  }

  const FIELD_NOT_FOUND = [
    ...(PAYLOAD_FIELD_NOT_FOUND ?? []),
    ...(DATABASE_ACCESS_NOT_FOUND ?? []),
  ];
  if (FIELD_NOT_FOUND.length > 0) {
    evaluationErrorVMs.push({
      error: 'FIELD_NOT_FOUND',
      count: FIELD_NOT_FOUND.length,
    });
  }

  const expectedErrorVMs = R.pipe(
    expectedErrors,
    R.toPairs.strict,
    R.map(([error, evaluationErrors]) => ({
      error,
      count: evaluationErrors.length,
    })),
  );
  evaluationErrorVMs.push(...expectedErrorVMs);

  return evaluationErrorVMs;
}

export function useGetNodeEvaluationErrorMessage() {
  const { t } = useTranslation(['scenarios']);

  return useCallback(
    (evaluationError: EvaluationErrorViewModel) =>
      commonErrorMessages(t)(evaluationError),
    [t],
  );
}

export function useGetOrAndNodeEvaluationErrorMessage() {
  const { t } = useTranslation(['scenarios']);

  return useCallback(
    (evaluationError: EvaluationErrorViewModel) => {
      switch (evaluationError.error) {
        case 'WRONG_NUMBER_OF_ARGUMENTS':
          return t('scenarios:validation.decision.rule_formula_required');
        default:
          return commonErrorMessages(t)(evaluationError);
      }
    },
    [t],
  );
}

const commonErrorMessages =
  (t: TFunction<['scenarios']>) =>
  (evaluationError: EvaluationErrorViewModel) => {
    switch (evaluationError.error) {
      case 'UNDEFINED_FUNCTION':
        return t('scenarios:validation.evaluation_error.undefined_function', {
          count: evaluationError.count,
        });
      case 'WRONG_NUMBER_OF_ARGUMENTS':
        return t(
          'scenarios:validation.evaluation_error.wrong_number_of_arguments',
        );
      case 'MISSING_NAMED_ARGUMENT':
        return t(
          'scenarios:validation.evaluation_error.missing_named_argument',
          {
            count: evaluationError.count,
          },
        );
      case 'ARGUMENTS_MUST_BE_INT_OR_FLOAT':
        return t(
          'scenarios:validation.evaluation_error.arguments_must_be_int_or_float',
          {
            count: evaluationError.count,
          },
        );
      case 'ARGUMENTS_MUST_BE_INT_FLOAT_OR_TIME':
        return t(
          'scenarios:validation.evaluation_error.arguments_must_be_int_float_or_time',
          { count: evaluationError.count },
        );
      case 'ARGUMENT_MUST_BE_INTEGER':
        return t(
          'scenarios:validation.evaluation_error.argument_must_be_integer',
          {
            count: evaluationError.count,
          },
        );
      case 'ARGUMENT_MUST_BE_STRING':
        return t(
          'scenarios:validation.evaluation_error.argument_must_be_string',
          {
            count: evaluationError.count,
          },
        );
      case 'ARGUMENT_MUST_BE_BOOLEAN':
        return t(
          'scenarios:validation.evaluation_error.argument_must_be_boolean',
          {
            count: evaluationError.count,
          },
        );
      case 'ARGUMENT_MUST_BE_LIST':
        return t(
          'scenarios:validation.evaluation_error.argument_must_be_list',
          {
            count: evaluationError.count,
          },
        );
      case 'ARGUMENT_MUST_BE_CONVERTIBLE_TO_DURATION':
        return t(
          'scenarios:validation.evaluation_error.argument_must_be_convertible_to_duration',
          {
            count: evaluationError.count,
          },
        );
      case 'ARGUMENT_MUST_BE_TIME':
        return t(
          'scenarios:validation.evaluation_error.argument_must_be_time',
          {
            count: evaluationError.count,
          },
        );
      case 'FUNCTION_ERROR':
        return t('scenarios:validation.evaluation_error.function_error', {
          count: evaluationError.count,
        });
      case 'ARGUMENT_REQUIRED':
        return t('scenarios:validation.evaluation_error.argument_required', {
          count: evaluationError.count,
        });
      case 'ARGUMENT_INVALID_TYPE':
        return t(
          'scenarios:validation.evaluation_error.argument_invalid_type',
          {
            count: evaluationError.count,
          },
        );
      case 'LIST_NOT_FOUND':
        return t('scenarios:validation.evaluation_error.list_not_found', {
          count: evaluationError.count,
        });
      case 'FIELD_NOT_FOUND':
        return t('scenarios:validation.evaluation_error.field_not_found', {
          count: evaluationError.count,
        });
      case 'UNEXPECTED_ERROR':
        return evaluationError.message;
      default:
        assertNever(
          '[EvaluationError] unhandled error code',
          evaluationError['code'],
        );
    }
  };

export function useGetScenarioErrorMessage() {
  const { t } = useTranslation(['scenarios']);

  return useCallback(
    (evaluationErrorCode: ScenarioValidationErrorCodeDto) => {
      switch (evaluationErrorCode) {
        case 'TRIGGER_CONDITION_REQUIRED':
          return t('scenarios:validation.decision.trigger_condition_required');
        case 'RULE_FORMULA_REQUIRED':
          return t('scenarios:validation.decision.rule_formula_required');
        case 'SCORE_REVIEW_THRESHOLD_REQUIRED':
          return t(
            'scenarios:validation.decision.score_review_threshold_required',
          );
        case 'SCORE_REJECT_THRESHOLD_REQUIRED':
          return t(
            'scenarios:validation.decision.score_reject_threshold_required',
          );
        case 'SCORE_REJECT_REVIEW_THRESHOLDS_MISSMATCH':
          return t(
            'scenarios:validation.decision.score_reject_review_thresholds_missmatch',
          );
        default:
          return evaluationErrorCode;
      }
    },
    [t],
  );
}
