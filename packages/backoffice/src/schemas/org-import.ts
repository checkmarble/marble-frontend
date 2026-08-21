import { z } from 'zod/v4';

/**
 * Wire schema for `dto.OrgImport` (marble-backend/dto/org_import.go), as produced by
 * `GET /org-export` and consumed by `POST /org-import`.
 *
 * Two things shape this file:
 *
 * 1. The parse output *is* the payload. It is stripped at the dropzone (ChoiceStep) and
 *    again by the server-fn validator, then POSTed as-is — the backend types the body as
 *    a bare `object`, so anything not declared here never reaches it. Hence `looseObject`
 *    everywhere: the backend DTO grows between releases, and `z.object` would silently
 *    delete the next version's fields.
 * 2. Empty collections arrive as `null`, not `[]` — every collection in `OrgImport` is a
 *    Go slice/map on a json tag without `omitempty`, so nil serialises to `null`. The
 *    exporter never populates `admins` or `seeds` at all.
 *
 * It is deliberately tolerant: only `org.name` and `tags[].name` are `binding:"required"`
 * on the backend, and the backend is authoritative for the rest. Business validation of
 * the operator-editable subset lives in `importEditSchema` (ImportFlow), where a bad
 * value can actually be fixed — rejecting a valid export at the dropzone is a dead end.
 */

/**
 * Accepts `null` (Go nil) and absence, emits `undefined`. The inferred type is
 * `T | undefined` rather than `T | null | undefined`, and `JSON.stringify` drops the key
 * on the way back out, which Go decodes as nil exactly like an explicit `null`.
 *
 * `.optional()` alone would not work: in zod it means "key absent" and rejects `null`.
 */
const opt = <T extends z.ZodType>(schema: T) => schema.nullish().transform((value) => value ?? undefined);

/**
 * Opaque identifiers. Most ids in the spec are plain Go strings, used only as keys into
 * the importer's id remap table (every id is regenerated on import), so `z.uuid()` here
 * would reject valid specs for no benefit. `z.uuid()` is used only where the DTO really
 * declares `uuid.UUID`.
 */
const specId = z.string();

const metadataSpec = z.looseObject({
  label: opt(z.string()),
  description: opt(z.string()),
  app_version: opt(z.string()),
});

/** `ImportOrg` = `{ name }` + embedded `UpdateOrganizationBodyDto`. */
const orgSpec = z.looseObject({
  name: z.string().nonempty(),
  default_scenario_timezone: opt(z.string()),
  sanctions_threshold: opt(z.int()),
  sanctions_limit: opt(z.int()),
  /** Keyed by screening feature, valued by provider (`opensanctions` | `lexisnexis`). */
  screening_providers: opt(z.record(z.string(), z.string())),
  auto_assign_queue_limit: opt(z.int()),
  sentry_replay_enabled: opt(z.boolean()),
  environment: opt(z.string()),
});

/** `CreateUser`. `role` and `organization_id` are ignored by the importer. */
const adminSpec = z.looseObject({
  email: z.string(),
  first_name: opt(z.string()),
  last_name: opt(z.string()),
});

/**
 * `dto.Field`. `unicity_constraint` and `semantic_type` stay `z.string()`: the backend
 * enum has three values while the export uses two, and `semantic_type` is exported as
 * `''`, so an enum would reject valid specs.
 */
const fieldSpec = z.looseObject({
  id: specId,
  name: opt(z.string()),
  data_type: z.string(),
  description: opt(z.string()),
  nullable: opt(z.boolean()),
  is_enum: opt(z.boolean()),
  table_id: opt(specId),
  values: opt(z.array(z.any())),
  unicity_constraint: opt(z.string()),
  alias: opt(z.string()),
  semantic_type: opt(z.string()),
  ftm_property: opt(z.string()),
  metadata: z.any().optional(),
});

/**
 * `dto.Table`. The exporter hoists `links_to_single` and per-table `navigation_options`
 * to the top level of `data_model`, so they are absent here in practice.
 */
const tableSpec = z.looseObject({
  id: specId,
  name: z.string(),
  description: opt(z.string()),
  fields: opt(z.record(z.string(), fieldSpec)),
  alias: opt(z.string()),
  semantic_type: opt(z.string()),
  caption_field: opt(z.string()),
  primary_ordering_field: opt(z.string()),
  ftm_entity: opt(z.string()),
  metadata: z.any().optional(),
});

const linkSpec = z.looseObject({
  id: specId,
  name: opt(z.string()),
  link_type: opt(z.string()),
  parent_table_name: z.string(),
  parent_table_id: specId,
  parent_field_name: opt(z.string()),
  parent_field_id: specId,
  child_table_name: z.string(),
  child_table_id: specId,
  child_field_name: opt(z.string()),
  child_field_id: specId,
});

const pivotSpec = z.looseObject({
  id: z.uuid(),
  base_table_id: specId,
  field_id: opt(specId),
  path_link_ids: opt(z.array(specId)),
  created_at: opt(z.string()),
  organization_id: opt(z.uuid()),
});

const navigationOptionSpec = z.looseObject({
  source_field_id: specId,
  target_table_id: specId,
  filter_field_id: opt(z.string()),
  ordering_field_id: opt(z.string()),
});

const dataModelSpec = z.looseObject({
  tables: opt(z.array(tableSpec)),
  links: opt(z.array(linkSpec)),
  pivots: opt(z.array(pivotSpec)),
  /** `map[string][]CreateNavigationOptionInput` — an array per source table id. */
  navigation_options: opt(z.record(z.string(), z.array(navigationOptionSpec))),
});

/** Only `name`, `description` and `trigger_object_type` are read by the importer. */
const scenarioDataSpec = z.looseObject({
  id: specId,
  name: z.string(),
  description: opt(z.string()),
  trigger_object_type: z.string(),
  live_version_id: opt(z.string()),
  organization_id: opt(z.uuid()),
  archived: opt(z.boolean()),
  created_at: opt(z.string()),
});

/** `dto.RuleDto`. `display_order` is re-derived from array index by the importer. */
const ruleSpec = z.looseObject({
  id: opt(specId),
  stable_id: specId,
  name: z.string(),
  description: opt(z.string()),
  formula_ast_expression: z.any().optional(),
  score_modifier: opt(z.int()),
  rule_group: opt(z.string()),
  display_order: opt(z.int()),
});

const iterationSpec = z.looseObject({
  trigger_condition_ast_expression: z.any().optional(),
  rules: opt(z.array(ruleSpec)),
  /** Passed through verbatim — the shape is large and nothing here reads into it. */
  screening_configs: opt(z.array(z.looseObject({}))),
  score_review_threshold: opt(z.int()),
  score_block_and_review_threshold: opt(z.int()),
  score_decline_threshold: opt(z.int()),
  schedule: opt(z.string()),
});

const scenarioSpec = z.looseObject({
  scenario: scenarioDataSpec,
  iteration: iterationSpec,
});

/** `dto.ImportTag` = `CreateTagBody` + `Id`. `color` is `binding:"required,hexcolor"`. */
const tagSpec = z.looseObject({
  id: specId,
  name: z.string().nonempty(),
  color: z.string().regex(/^#?[0-9a-fA-F]{3,8}$/, 'Expected a hex color.'),
  target: opt(z.enum(['case', 'object']).or(z.literal(''))),
});

/** `dto.ImportCustomList`. `kind` must be `text` or `cidrs` or the import aborts. */
const customListSpec = z.looseObject({
  id: specId,
  name: z.string(),
  description: opt(z.string()),
  kind: opt(z.string()),
  values: opt(z.array(z.string())),
});

/** `dto.InboxDto`. The importer reads only `name` (and `id`, to remap it). */
const inboxSpec = z.looseObject({
  id: specId,
  name: z.string(),
});

/** `params` is polymorphic — an array for `outcome_in`, an object for the rest. */
const workflowConditionSpec = z.looseObject({
  id: opt(z.uuid()),
  function: z.string(),
  params: z.any().optional(),
});

const workflowActionSpec = z.looseObject({
  id: opt(z.uuid()),
  action: z.string(),
  params: z.any().optional(),
});

/** `fallthrough` is exported but dropped on import. */
const workflowSpec = z.looseObject({
  id: z.uuid(),
  scenario_id: z.uuid(),
  name: z.string(),
  fallthrough: opt(z.boolean()),
  conditions: opt(z.array(workflowConditionSpec)),
  actions: opt(z.array(workflowActionSpec)),
});

const ingestionFieldSpec = z.looseObject({
  ref: opt(z.string()),
  constant: z.any().optional(),
  enum: opt(z.array(z.any())),
  int_range: opt(z.array(z.int())),
  float_range: opt(z.array(z.number())),
  generator: opt(z.string()),
  cast: opt(z.string()),
});

const ingestionSpec = z.looseObject({
  table: z.string(),
  count: z.int(),
  fields: opt(z.record(z.string(), ingestionFieldSpec)),
});

const seedSpec = z.looseObject({
  ingestion: opt(z.record(z.string(), ingestionSpec)),
  decisions: opt(z.record(z.string(), z.int())),
});

export const orgImportSpecSchema = z.looseObject({
  metadata: opt(metadataSpec),
  org: orgSpec,
  admins: opt(z.array(adminSpec)),
  data_model: dataModelSpec,
  scenarios: opt(z.array(scenarioSpec)),
  tags: opt(z.array(tagSpec)),
  custom_lists: opt(z.array(customListSpec)),
  inboxes: opt(z.array(inboxSpec)),
  workflows: opt(z.array(workflowSpec)),
  seeds: opt(seedSpec),
});

export type OrgImportSpec = z.infer<typeof orgImportSpecSchema>;
/** Use when typing a value *before* parsing (collections still accept `null`). */
export type OrgImportSpecInput = z.input<typeof orgImportSpecSchema>;
