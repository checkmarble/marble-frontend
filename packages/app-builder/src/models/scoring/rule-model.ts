import { type AggregationAstNode } from '../astNode/aggregation';
import { type PayloadAstNode } from '../astNode/data-accessor';
import { type BoolSwitch, type NumberSwitch, type StringSwitch, type TagsSwitch } from './conditions';

// --- Complete rule types (fields always present, used for saved data) ---

export type UserAttributeRule = {
  type: 'user_attribute';
  field: PayloadAstNode;
  conditions: NumberSwitch | StringSwitch | BoolSwitch;
};

export type AggregateRule = {
  type: 'aggregate';
  field: AggregationAstNode;
  conditions: NumberSwitch | StringSwitch | BoolSwitch;
};

export type ScreeningTagsRule = { type: 'screening_tags'; conditions: TagsSwitch };
export type EntityTagsRule = { type: 'entity_tags'; conditions: TagsSwitch };

/** Always-complete model — use this for saved/submitted data. */
export type RuleModel = UserAttributeRule | AggregateRule | ScreeningTagsRule | EntityTagsRule;

export const RULE_TYPES = ['user_attribute', 'aggregate', 'screening_tags', 'entity_tags'] as const;
export type RuleModelType = (typeof RULE_TYPES)[number];

// --- Draft rule types (fields may be null, used during editing) ---

export type DraftUserAttributeRule = {
  type: 'user_attribute';
  field: PayloadAstNode | null;
  conditions: (NumberSwitch | StringSwitch | BoolSwitch) | null;
};

export type DraftAggregateRule = {
  type: 'aggregate';
  field: AggregationAstNode | null;
  conditions: (NumberSwitch | StringSwitch | BoolSwitch) | null;
};

/**
 * Editing-time model — field/conditions may be null while the user is configuring
 * a fielded rule. Tags rules are always complete and included as-is.
 */
export type DraftRuleModel = DraftUserAttributeRule | DraftAggregateRule | ScreeningTagsRule | EntityTagsRule;

// --- Type guards ---

/** Narrows a DraftRuleModel to RuleModel (all fields present). */
export function isCompleteRule(model: DraftRuleModel): model is RuleModel {
  if (model.type === 'user_attribute' || model.type === 'aggregate') {
    return model.field !== null && model.conditions !== null;
  }
  return true;
}
