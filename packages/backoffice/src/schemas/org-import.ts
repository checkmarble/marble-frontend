import { z } from 'zod/v4';

const orgSpec = z.object({
  name: z.string().nonempty(),
  default_scenario_timezone: z.string().optional(),
  sanctions_threshold: z.number().optional(),
  sanctions_limit: z.number().optional(),
});

const adminSpec = z.object({
  email: z.email(),
  first_name: z.string().nonempty(),
  last_name: z.string().nonempty(),
});

const fieldSpec = z.object({
  id: z.uuid(),
  data_type: z.string(),
  description: z.string().optional(),
});

const tableSpec = z.object({
  id: z.uuid(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  fields: z.record(z.string(), fieldSpec),
});

const linkSpec = z.object({
  id: z.uuid(),
  parent_table_name: z.string(),
  parent_table_id: z.uuid(),
  parent_field_id: z.uuid(),
  child_table_name: z.string(),
  child_table_id: z.uuid(),
  child_field_id: z.uuid(),
});

const pivotSpec = z.object({
  id: z.uuid(),
  base_table_id: z.uuid(),
  path_link_ids: z.array(z.uuid()),
});

const navigationOptionSpec = z.object({
  source_field_id: z.uuid(),
  target_table_id: z.uuid(),
  filter_field_id: z.uuid(),
  ordering_field_id: z.uuid(),
});

const dataModelSpec = z.object({
  tables: z.array(tableSpec),
  links: z.array(linkSpec),
  pivots: z.array(pivotSpec),
  navigation_options: z.record(z.uuid(), navigationOptionSpec),
});

const scenarioDataSpec = z.object({
  id: z.uuid(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  trigger_object_type: z.string().nonempty(),
});

const ruleSpec = z.object({
  id: z.uuid(),
  stable_id: z.uuid(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  formula_ast_expression: z.any(),
});

const iterationSpec = z.object({
  trigger_condition_ast_expression: z.any(),
  rules: z.array(ruleSpec),
});

const scenarioSpec = z.object({
  scenario: scenarioDataSpec,
  iteration: iterationSpec,
});

const tagSpec = z.object({
  id: z.uuid(),
  name: z.string().nonempty(),
  target: z.string().nonempty(),
  color: z.string().nonempty(),
});

const customListSpec = z.object({
  id: z.uuid(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  values: z.array(z.string()),
});

const inboxSpec = z.object({
  id: z.uuid(),
  name: z.string().nonempty(),
});

const workflowConditionSpec = z.object({
  function: z.string(),
  params: z.any(),
});

const workflowActionSpec = z.object({
  action: z.string(),
  params: z.any(),
});

const workflowSpec = z.object({
  id: z.uuid(),
  scenario_id: z.uuid(),
  name: z.string().nonempty(),
  fallthrough: z.boolean(),
  conditions: z.array(workflowConditionSpec),
  actions: z.array(workflowActionSpec),
});

const ingestionSpec = z.object({
  count: z.number(),
  fields: z.record(z.string(), z.any()),
});

const seedSpec = z.object({
  ingestion: z.record(z.string(), ingestionSpec),
  decisions: z.record(z.string(), z.number()),
});

export const orgImportSpecSchema = z.object({
  org: orgSpec,
  admins: z.array(adminSpec),
  data_model: dataModelSpec,
  scenarios: z.array(scenarioSpec),
  tags: z.array(tagSpec),
  custom_lists: z.array(customListSpec),
  inboxes: z.array(inboxSpec),
  workflows: z.array(workflowSpec),
  seeds: seedSpec.optional(),
});

export type OrgImportSpec = z.infer<typeof orgImportSpecSchema>;
