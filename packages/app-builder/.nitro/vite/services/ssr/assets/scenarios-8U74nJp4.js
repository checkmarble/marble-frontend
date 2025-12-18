import { o as object, s as string, j as uuid, p as boolean, m as literal } from "./short-uuid-MIi3jWzx.js";
const activateIterationPayloadSchema = object({
  willBeLive: boolean().pipe(literal(true)),
  changeIsImmediate: boolean().pipe(literal(true))
});
const commitIterationPayloadSchema = object({
  draftIsReadOnly: boolean().pipe(literal(true)),
  activateToGoInProd: boolean().pipe(literal(true)),
  changeIsImmediate: boolean().pipe(literal(true))
});
const deactivateIterationPayloadSchema = object({
  stopOperating: boolean().pipe(literal(true)),
  changeIsImmediate: boolean().pipe(literal(true))
});
const prepareIterationPayloadSchema = object({
  activateToGoInProd: boolean().pipe(literal(true)),
  preparationIsAsync: boolean().pipe(literal(true))
});
const deleteRulePayloadSchema = object({
  ruleId: string()
});
const duplicateRulePayloadSchema = object({
  ruleId: string()
});
const archiveScenarioPayloadSchema = object({
  scenarioId: uuid()
});
const copyScenarioPayloadSchema = object({
  scenarioId: uuid(),
  name: string().optional()
});
const createScenarioPayloadSchema = object({
  name: string().min(1),
  description: string(),
  triggerObjectType: string().min(1)
});
const unarchiveScenarioPayloadSchema = object({
  scenarioId: uuid()
});
const updateScenarioPayloadSchema = object({
  scenarioId: uuid(),
  name: string().min(1),
  description: string()
});
const createTestRunPayloadSchema = object({
  refIterationId: string(),
  testIterationId: string(),
  endDate: string()
});
object({
  rule_id: string().uuid(),
  instruction: string().min(1)
});
const generateRuleInputSchema = object({
  scenarioId: string(),
  ruleId: string().uuid(),
  instruction: string().min(1)
});
export {
  updateScenarioPayloadSchema as a,
  copyScenarioPayloadSchema as b,
  createScenarioPayloadSchema as c,
  archiveScenarioPayloadSchema as d,
  createTestRunPayloadSchema as e,
  commitIterationPayloadSchema as f,
  activateIterationPayloadSchema as g,
  deactivateIterationPayloadSchema as h,
  duplicateRulePayloadSchema as i,
  deleteRulePayloadSchema as j,
  generateRuleInputSchema as k,
  prepareIterationPayloadSchema as p,
  unarchiveScenarioPayloadSchema as u
};
