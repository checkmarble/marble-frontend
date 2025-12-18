import { r as reactExports } from "../server.js";
import { $ as t, u as t$1, o as t$2, p as t$3, bH as assertNever } from "./services-middleware-DR8Hua1Y.js";
import { u as useTranslation } from "./format-NPGUXq-g.js";
function adaptEvaluationErrorViewModels(evaluationErrors) {
  const {
    UNEXPECTED_ERROR,
    RUNTIME_EXPRESSION_ERROR,
    WRONG_NUMBER_OF_ARGUMENTS,
    DATABASE_ACCESS_NOT_FOUND,
    PAYLOAD_FIELD_NOT_FOUND,
    ...expectedErrors
  } = t(evaluationErrors, ({ error }) => error);
  const evaluationErrorVMs = [];
  if (UNEXPECTED_ERROR) {
    const unexpectedErrorVMs = t$1(
      UNEXPECTED_ERROR,
      t$2((error) => ({
        error: "UNEXPECTED_ERROR",
        message: error.message
      }))
    );
    evaluationErrorVMs.push(...unexpectedErrorVMs);
  }
  if (RUNTIME_EXPRESSION_ERROR) {
    const runtimeExpressionErrorVMs = t$1(
      RUNTIME_EXPRESSION_ERROR,
      t$2((error) => ({
        error: "RUNTIME_EXPRESSION_ERROR",
        message: error.message
      }))
    );
    evaluationErrorVMs.push(...runtimeExpressionErrorVMs);
  }
  if (WRONG_NUMBER_OF_ARGUMENTS) {
    evaluationErrorVMs.push({
      error: "WRONG_NUMBER_OF_ARGUMENTS"
    });
  }
  const FIELD_NOT_FOUND = [...PAYLOAD_FIELD_NOT_FOUND ?? [], ...DATABASE_ACCESS_NOT_FOUND ?? []];
  if (FIELD_NOT_FOUND.length > 0) {
    evaluationErrorVMs.push({
      error: "FIELD_NOT_FOUND",
      count: FIELD_NOT_FOUND.length
    });
  }
  const expectedErrorVMs = t$1(
    expectedErrors,
    t$3(),
    t$2(([error, evaluationErrors2]) => ({
      error,
      count: evaluationErrors2.length
    }))
  );
  evaluationErrorVMs.push(...expectedErrorVMs);
  return evaluationErrorVMs;
}
const commonErrorMessages = (t2) => (evaluationError) => {
  switch (evaluationError.error) {
    case "UNDEFINED_FUNCTION":
      return t2("scenarios:validation.evaluation_error.undefined_function", {
        count: evaluationError.count
      });
    case "WRONG_NUMBER_OF_ARGUMENTS":
      return t2("scenarios:validation.evaluation_error.wrong_number_of_arguments");
    case "FILTERS_TABLE_NOT_MATCH":
      return t2("scenarios:validation.evaluation_error.filters_table_not_match");
    case "AGGREGATION_FIELD_NOT_CHOSEN":
      return t2("scenarios:validation.evaluation_error.aggregation_field_not_chosen");
    case "AGGREGATION_FIELD_INCOMPATIBLE_WITH_AGGREGATOR":
      return t2("scenarios:validation.evaluation_error.aggregation_field_incompatible_with_aggregator");
    case "MISSING_NAMED_ARGUMENT":
      return t2("scenarios:validation.evaluation_error.missing_named_argument", {
        count: evaluationError.count
      });
    case "ARGUMENTS_MUST_BE_INT_OR_FLOAT":
      return t2("scenarios:validation.evaluation_error.arguments_must_be_int_or_float", {
        count: evaluationError.count
      });
    case "ARGUMENTS_MUST_BE_INT_FLOAT_OR_TIME":
      return t2("scenarios:validation.evaluation_error.arguments_must_be_int_float_or_time", {
        count: evaluationError.count
      });
    case "ARGUMENT_MUST_BE_INTEGER":
      return t2("scenarios:validation.evaluation_error.argument_must_be_integer", {
        count: evaluationError.count
      });
    case "ARGUMENT_MUST_BE_STRING":
      return t2("scenarios:validation.evaluation_error.argument_must_be_string", {
        count: evaluationError.count
      });
    case "ARGUMENT_MUST_BE_BOOLEAN":
      return t2("scenarios:validation.evaluation_error.argument_must_be_boolean", {
        count: evaluationError.count
      });
    case "ARGUMENT_MUST_BE_LIST":
      return t2("scenarios:validation.evaluation_error.argument_must_be_list", {
        count: evaluationError.count
      });
    case "ARGUMENT_MUST_BE_STRING_OR_LIST":
      return t2("scenarios:validation.evaluation_error.argument_must_be_string_or_list", {
        count: evaluationError.count
      });
    case "ARGUMENT_MUST_BE_CONVERTIBLE_TO_DURATION":
      return t2("scenarios:validation.evaluation_error.argument_must_be_convertible_to_duration", {
        count: evaluationError.count
      });
    case "ARGUMENT_MUST_BE_TIME":
      return t2("scenarios:validation.evaluation_error.argument_must_be_time", {
        count: evaluationError.count
      });
    case "FUNCTION_ERROR":
      return t2("scenarios:validation.evaluation_error.function_error", {
        count: evaluationError.count
      });
    case "ARGUMENT_REQUIRED":
      return t2("scenarios:validation.evaluation_error.argument_required", {
        count: evaluationError.count
      });
    case "ARGUMENT_INVALID_TYPE":
      return t2("scenarios:validation.evaluation_error.argument_invalid_type", {
        count: evaluationError.count
      });
    case "LIST_NOT_FOUND":
      return t2("scenarios:validation.evaluation_error.list_not_found", {
        count: evaluationError.count
      });
    case "FIELD_NOT_FOUND":
      return t2("scenarios:validation.evaluation_error.field_not_found", {
        count: evaluationError.count
      });
    case "NULL_FIELD_READ":
      return t2("scenarios:validation.evaluation_error.null_field_read", {
        count: evaluationError.count
      });
    case "NO_ROWS_READ":
      return t2("scenarios:validation.evaluation_error.no_rows_read", {
        count: evaluationError.count
      });
    case "DIVISION_BY_ZERO":
      return t2("scenarios:validation.evaluation_error.division_by_zero", {
        count: evaluationError.count
      });
    case "PAYLOAD_FIELD_NOT_FOUND":
      return t2("scenarios:validation.evaluation_error.payload_field_not_found", {
        count: evaluationError.count
      });
    case "RUNTIME_EXPRESSION_ERROR":
    case "UNEXPECTED_ERROR":
      return evaluationError.message;
    default:
      assertNever("[EvaluationError] unhandled error code", evaluationError["code"]);
  }
};
function useGetScenarioErrorMessage() {
  const { t: t2 } = useTranslation(["scenarios"]);
  return reactExports.useCallback(
    (evaluationErrorCode) => {
      switch (evaluationErrorCode) {
        case "TRIGGER_CONDITION_REQUIRED":
          return t2("scenarios:validation.decision.trigger_condition_required");
        case "RULE_FORMULA_REQUIRED":
          return t2("scenarios:validation.decision.rule_formula_required");
        case "SCORE_THRESHOLD_MISSING":
          return t2("scenarios:validation.decision.score_threshold_missing");
        case "SCORE_THRESHOLDS_MISMATCH":
          return t2("scenarios:validation.decision.score_thresholds_mismatch");
        case "FORMULA_MUST_RETURN_BOOLEAN":
          return t2("scenarios:validation.decision.formula_must_return_boolean");
        default:
          if (evaluationErrorCode.startsWith(`FORMULA_INCORRECT_RETURN_TYPE`)) {
            const errorCode = evaluationErrorCode;
            return t2(`scenarios:validation.decision.${errorCode.toLowerCase()}`);
          }
          return evaluationErrorCode;
      }
    },
    [t2]
  );
}
export {
  adaptEvaluationErrorViewModels as a,
  commonErrorMessages as c,
  useGetScenarioErrorMessage as u
};
