import { z } from 'zod/v4';

export const activateIterationPayloadSchema = z.object({
  willBeLive: z.boolean().pipe(z.literal(true)),
  changeIsImmediate: z.boolean().pipe(z.literal(true)),
});
export type ActivateIterationPayload = z.infer<typeof activateIterationPayloadSchema>;

export const commitIterationPayloadSchema = z.object({
  draftIsReadOnly: z.boolean().pipe(z.literal(true)),
  activateToGoInProd: z.boolean().pipe(z.literal(true)),
  changeIsImmediate: z.boolean().pipe(z.literal(true)),
});
export type CommitIterationPayload = z.infer<typeof commitIterationPayloadSchema>;

export const deactivateIterationPayloadSchema = z.object({
  stopOperating: z.boolean().pipe(z.literal(true)),
  changeIsImmediate: z.boolean().pipe(z.literal(true)),
});
export type DeactivateIterationPayload = z.infer<typeof deactivateIterationPayloadSchema>;

export const prepareIterationPayloadSchema = z.object({
  activateToGoInProd: z.boolean().pipe(z.literal(true)),
  preparationIsAsync: z.boolean().pipe(z.literal(true)),
});
export type PrepareIterationPayload = z.infer<typeof prepareIterationPayloadSchema>;

export const deleteRulePayloadSchema = z.object({
  ruleId: z.string(),
});
export type DeleteRulePayload = z.infer<typeof deleteRulePayloadSchema>;

export const duplicateRulePayloadSchema = z.object({
  ruleId: z.string(),
});
export type DuplicateRulePayload = z.infer<typeof duplicateRulePayloadSchema>;

export const archiveScenarioPayloadSchema = z.object({
  scenarioId: z.uuid(),
});
export type ArchiveScenarioPayload = z.infer<typeof archiveScenarioPayloadSchema>;

export const copyScenarioPayloadSchema = z.object({
  scenarioId: z.uuid(),
  name: z.string().optional(),
});
export type CopyScenarioPayload = z.infer<typeof copyScenarioPayloadSchema>;

export const createScenarioPayloadSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  triggerObjectType: z.string().min(1),
});
export type CreateScenarioPayload = z.infer<typeof createScenarioPayloadSchema>;

export const unarchiveScenarioPayloadSchema = z.object({
  scenarioId: z.uuid(),
});
export type UnarchiveScenarioPayload = z.infer<typeof unarchiveScenarioPayloadSchema>;

export const updateScenarioPayloadSchema = z.object({
  scenarioId: z.uuid(),
  name: z.string().min(1),
  description: z.string(),
});
export type UpdateScenarioPayload = z.infer<typeof updateScenarioPayloadSchema>;

export const createTestRunPayloadSchema = z.object({
  refIterationId: z.string(),
  testIterationId: z.string(),
  endDate: z.string(),
});
export type CreateTestRunPayload = z.infer<typeof createTestRunPayloadSchema>;

const generateRuleBodySchema = z.object({
  rule_id: z.string().uuid(),
  instruction: z.string().min(1),
});
export type GenerateRuleBody = z.infer<typeof generateRuleBodySchema>;

export const generateRuleInputSchema = z.object({
  scenarioId: z.string(),
  ruleId: z.string().uuid(),
  instruction: z.string().min(1),
});
export type GenerateRuleInput = z.infer<typeof generateRuleInputSchema>;
