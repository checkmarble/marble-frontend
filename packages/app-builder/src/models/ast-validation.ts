import { type AstValidationDto, type ScenarioValidationErrorCodeDto } from 'marble-api';

import { adaptNodeEvaluation, type NodeEvaluation, type ReturnValueType } from './node-evaluation';

export type ScenarioValidationErrorCode =
  | ScenarioValidationErrorCodeDto
  | `FORMULA_INCORRECT_RETURN_TYPE.${ReturnValueType}`;

export type AstValidation = {
  errors: ScenarioValidationErrorCode[];
  evaluation: NodeEvaluation;
};

export function adaptScenarioValidationErrorCode(
  code: ScenarioValidationErrorCodeDto,
  returnType?: ReturnValueType,
): ScenarioValidationErrorCode {
  if (code !== 'FORMULA_INCORRECT_RETURN_TYPE' || !returnType) {
    return code;
  }
  return `${code}.${returnType}`;
}

export function adaptAstValidation(dto: AstValidationDto, expectedReturnType?: ReturnValueType): AstValidation {
  return {
    errors: dto.errors.map(({ error }) => adaptScenarioValidationErrorCode(error, expectedReturnType)),
    evaluation: adaptNodeEvaluation(dto.evaluation),
  };
}
