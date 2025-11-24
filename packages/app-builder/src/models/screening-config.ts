import { type ScreeningConfigDto } from 'marble-api';
import { mapValues } from 'radash';

import { type AstNode, adaptAstNode, adaptNodeDto } from './astNode/ast-node';
import { type Outcome } from './outcome';

export type ScreeningConfig = Partial<{
  id: string;
  name: string;
  description: string;
  ruleGroup: string;
  datasets: string[];
  threshold: number;
  forcedOutcome: Outcome;
  triggerRule: AstNode;
  entityType: ScreeningConfigDto['entity_type'];
  query: Partial<{
    name: AstNode;
    [key: string]: AstNode;
  }>;
  counterPartyId: AstNode;
  preprocessing?: {
    useNer?: boolean;
    nerIgnoreClassification?: boolean;
    skipIfUnder?: number;
    removeNumbers?: boolean;
    blacklistListId?: string;
  };
}>;

export function adaptScreeningConfig(dto: ScreeningConfigDto): ScreeningConfig {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    ruleGroup: dto.rule_group,
    datasets: dto.datasets,
    threshold: dto.threshold,
    forcedOutcome: dto.forced_outcome,
    triggerRule: dto.trigger_rule ? adaptAstNode(dto.trigger_rule) : undefined,
    entityType: dto.entity_type,
    query: mapValues(dto.query ?? {}, (node) => (node ? adaptAstNode(node) : undefined)),
    counterPartyId: dto.counterparty_id_expression ? adaptAstNode(dto.counterparty_id_expression) : undefined,
    preprocessing: dto.preprocessing
      ? {
          useNer: dto.preprocessing.use_ner,
          nerIgnoreClassification: dto.preprocessing.ner_ignore_classification,
          skipIfUnder: dto.preprocessing.skip_if_under,
          removeNumbers: dto.preprocessing.remove_numbers,
          blacklistListId: dto.preprocessing.ignore_list_id,
        }
      : undefined,
  };
}

export function adaptScreeningConfigDto(config: ScreeningConfig): ScreeningConfigDto {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    rule_group: config.ruleGroup,
    datasets: config.datasets,
    threshold: config.threshold,
    forced_outcome: config.forcedOutcome,
    trigger_rule: config.triggerRule ? adaptNodeDto(config.triggerRule) : undefined,
    entity_type: config.entityType,
    query: mapValues(config.query ?? {}, (node) =>
      node ? adaptNodeDto(node) : undefined,
    ) as ScreeningConfigDto['query'],
    counterparty_id_expression: config.counterPartyId ? adaptNodeDto(config.counterPartyId) : undefined,
    preprocessing: config.preprocessing
      ? {
          use_ner: config.preprocessing.useNer,
          skip_if_under: config.preprocessing.skipIfUnder,
          remove_numbers: config.preprocessing.removeNumbers,
          ignore_list_id: config.preprocessing.blacklistListId,
        }
      : undefined,
  };
}
