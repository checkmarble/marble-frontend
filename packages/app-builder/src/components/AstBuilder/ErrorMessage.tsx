import { type EvaluationError } from '@app-builder/models';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export interface ErrorMessageProps {
  errors?: EvaluationError[];
}

export function ErrorMessage({ errors }: ErrorMessageProps) {
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();

  const firstError = errors?.[0];

  return (
    <p className="text-s font-medium text-red-100 transition-opacity duration-200 ease-in-out">
      {firstError && getNodeEvaluationErrorMessage(firstError)}
    </p>
  );
}

export function useGetNodeEvaluationErrorMessage() {
  const { t } = useTranslation(['scenarios']);

  return useCallback(
    (evaluationError: EvaluationError) => {
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
          return t(
            'scenarios:validation.evaluation_error.argument_must_be_list'
          );
        case 'ARGUMENT_MUST_BE_CONVERTIBLE_TO_DURATION':
          return t(
            'scenarios:validation.evaluation_error.argument_must_be_convertible_to_duration'
          );
        case 'ARGUMENT_MUST_BE_TIME':
          return t(
            'scenarios:validation.evaluation_error.argument_must_be_time'
          );
        case 'ARGUMENT_REQUIRED':
          return t('validation.evaluation_error.argument_required');
        case 'AGGREGATION_ERROR':
          return t('validation.evaluation_error.aggregation_error');

        default:
          return `${evaluationError.error}:${evaluationError.message}`;
      }
    },
    [t]
  );
}
