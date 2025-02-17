import { type SanctionCheckConfigDto } from 'marble-api';

import { adaptAstNode, adaptNodeDto, type AstNode } from './astNode/ast-node';
import { type Outcome } from './outcome';

export type SanctionCheckConfig = {
  name?: string;
  description?: string;
  ruleGroup?: string;
  datasets?: string[];
  forceOutcome?: Outcome;
  triggerRule?: AstNode;
  query: {
    name: AstNode;
    label?: AstNode;
  };
  counterPartyId?: AstNode;
};

export function adaptSanctionCheckConfig(
  dto: SanctionCheckConfigDto,
): SanctionCheckConfig {
  return {
    name: dto.name,
    description: dto.description,
    ruleGroup: dto.rule_group,
    datasets: dto.datasets,
    forceOutcome: dto.force_outcome,
    triggerRule: dto.trigger_rule ? adaptAstNode(dto.trigger_rule) : undefined,
    query: {
      name: adaptAstNode(dto.query.name),
      label: dto.query?.label ? adaptAstNode(dto.query.label) : undefined,
    },
    counterPartyId: dto.counterparty_id_expression
      ? adaptAstNode(dto.counterparty_id_expression)
      : undefined,
  };
}

export function adaptSanctionCheckConfigDto(
  config: SanctionCheckConfig,
): SanctionCheckConfigDto {
  return {
    name: config.name,
    description: config.description,
    rule_group: config.ruleGroup,
    datasets: config.datasets,
    force_outcome: config.forceOutcome,
    trigger_rule: config.triggerRule
      ? adaptNodeDto(config.triggerRule)
      : undefined,
    query: {
      name: adaptNodeDto(config.query.name),
      label: config.query?.label ? adaptNodeDto(config.query.label) : undefined,
    },
    counterparty_id_expression: config.counterPartyId
      ? adaptNodeDto(config.counterPartyId)
      : undefined,
  };
}
