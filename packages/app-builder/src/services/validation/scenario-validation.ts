import {
  type EvaluationError,
  isUndefinedFunctionError,
  type NodeEvaluation,
  type ScenarioValidation,
} from '@app-builder/models';
import { useCallback } from 'react';
import { type FieldError } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';

// return just an array of error from a recursive evaluation
function flattenNodeEvaluationErrors(
  evaluation: NodeEvaluation
): EvaluationError[] {
  return [
    ...(evaluation.errors ?? []),
    ...evaluation.children.flatMap(flattenNodeEvaluationErrors),
    ...Object.values(evaluation.namedChildren).flatMap(
      flattenNodeEvaluationErrors
    ),
  ];
}

export function findRuleValidation(
  validation: ScenarioValidation,
  ruleId: string
): NodeEvaluation {
  const evaluation = validation.rulesEvaluations[ruleId];

  invariant(evaluation !== undefined, `Rule ${ruleId} not found in validation`);

  return evaluation;
}

export function countNodeEvaluationErrors(evaluation: NodeEvaluation): number {
  return flattenNodeEvaluationErrors(evaluation).length;
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

        default:
          return `${evaluationError.error}:${evaluationError.message}`;
      }
    },
    [t]
  );
}

interface InvalidStates {
  root: boolean; // propagate invalid state to all subcomponents
  children: Record<string, boolean>; // propagate invalid state to a specific children
  name: boolean; // propagate invalid state to the name field
}

//TODO(builder): remove this function when we will have our own state management
export function getInvalidStates(error?: FieldError): InvalidStates {
  if (!error) return { root: false, children: {}, name: false };

  // Rebuild evaluation error from react-hook-form error
  // TODO(builder): we should directly handle EvaluationError here in the future
  const evaluationError = {
    error: error.type,
    message: error.message ?? '',
  };
  if (isUndefinedFunctionError(evaluationError)) {
    return {
      root: false,
      children: {},
      name: true,
    };
  }
  return {
    root: true,
    children: {},
    name: true,
  };
}
