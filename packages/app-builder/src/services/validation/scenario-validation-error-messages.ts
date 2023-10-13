import { type EvaluationError } from '@app-builder/models';
import { type ScenarioValidationErrorCodeDto } from '@marble-api';
import { type TFunction } from 'i18next';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useGetNodeEvaluationErrorMessage() {
  const { t } = useTranslation(['scenarios']);

  return useCallback(
    (evaluationError: EvaluationError) =>
      commonErrorMessages(t)(evaluationError),
    [t]
  );
}

export function useGetOrAndNodeEvaluationErrorMessage() {
  const { t } = useTranslation(['scenarios']);

  return useCallback(
    (evaluationError: EvaluationError) => {
      switch (evaluationError.error) {
        case 'WRONG_NUMBER_OF_ARGUMENTS':
          return t('scenarios:validation.decision.rule_formula_required');
        default:
          return commonErrorMessages(t)(evaluationError);
      }
    },
    [t]
  );
}

const commonErrorMessages =
  (t: TFunction<['scenarios']>) => (evaluationError: EvaluationError) => {
    switch (evaluationError.error) {
      case 'UNDEFINED_FUNCTION':
        return t('scenarios:validation.evaluation_error.unknown_function');
      case 'WRONG_NUMBER_OF_ARGUMENTS':
        return t(
          'scenarios:validation.evaluation_error.wrong_number_of_arguments'
        );
      case 'MISSING_NAMED_ARGUMENT':
        return t(
          'scenarios:validation.evaluation_error.missing_named_argument'
        );
      case 'ARGUMENTS_MUST_BE_INT_OR_FLOAT':
        return t(
          'scenarios:validation.evaluation_error.arguments_must_be_int_or_float'
        );
      case 'ARGUMENT_MUST_BE_INTEGER':
        return t(
          'scenarios:validation.evaluation_error.argument_must_be_integer'
        );
      case 'ARGUMENT_MUST_BE_STRING':
        return t(
          'scenarios:validation.evaluation_error.argument_must_be_string'
        );
      case 'ARGUMENT_MUST_BE_BOOLEAN':
        return t(
          'scenarios:validation.evaluation_error.argument_must_be_boolean'
        );
      case 'ARGUMENT_MUST_BE_LIST':
        return t('scenarios:validation.evaluation_error.argument_must_be_list');
      case 'ARGUMENT_MUST_BE_CONVERTIBLE_TO_DURATION':
        return t(
          'scenarios:validation.evaluation_error.argument_must_be_convertible_to_duration'
        );
      case 'ARGUMENT_MUST_BE_TIME':
        return t('scenarios:validation.evaluation_error.argument_must_be_time');

      default:
        return `${evaluationError.error}:${evaluationError.message}`;
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
            'scenarios:validation.decision.score_review_threshold_required'
          );
        case 'SCORE_REJECT_THRESHOLD_REQUIRED':
          return t(
            'scenarios:validation.decision.score_reject_threshold_required'
          );
        case 'SCORE_REJECT_REVIEW_THRESHOLDS_MISSMATCH':
          return t(
            'scenarios:validation.decision.score_reject_review_thresholds_missmatch'
          );
        default:
          return evaluationErrorCode;
      }
    },
    [t]
  );
}
