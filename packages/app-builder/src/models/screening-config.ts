import { ScreeningConfigBodyFiltersDto, type ScreeningConfigDto } from 'marble-api';
import { mapValues } from 'radash';

import { type AstNode, adaptAstNode, adaptNodeDto } from './astNode/ast-node';
import { type Outcome } from './outcome';
import { ScreeningCategory } from './screening';

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
    datasets: dto.filters ? getDatasetFromFilters(dto.filters) : (dto?.datasets ?? []),
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
  const configDto = {
    id: config.id,
    name: config.name,
    description: config.description,
    rule_group: config.ruleGroup,
    datasets: [],
    filters: createScreeningFilters(config.datasets ?? []),
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
          ner_ignore_classification: config.preprocessing.nerIgnoreClassification,
          skip_if_under: config.preprocessing.skipIfUnder,
          remove_numbers: config.preprocessing.removeNumbers,
          ignore_list_id: config.preprocessing.blacklistListId,
        }
      : undefined,
  };
  return configDto;
}

const ConvertSectionNameToDto: Record<ScreeningCategory, keyof ScreeningConfigBodyFiltersDto> = {
  sanctions: 'sanctions',
  peps: 'peps',
  'third-parties': 'other',
  'adverse-media': 'adverse_media',
  global: 'global',
};

const DtoSectionToCategory: Record<keyof ScreeningConfigBodyFiltersDto, ScreeningCategory> = {
  sanctions: 'sanctions',
  peps: 'peps',
  adverse_media: 'adverse-media',
  other: 'third-parties',
  global: 'global',
};

export function createScreeningFilters(selection: string[]): ScreeningConfigBodyFiltersDto {
  const filters: ScreeningConfigBodyFiltersDto = {
    sanctions: { enabled: false },
    peps: { enabled: false },
    adverse_media: { enabled: false },
    other: { enabled: false },
    global: { enabled: false },
  };
  for (const item of selection) {
    const chunks = item.split(':');
    const sectionChuk = chunks[0] as ScreeningCategory;
    const section = ConvertSectionNameToDto[sectionChuk];
    if (!filters[section]) continue;
    if (chunks.length === 1) filters[section].enabled = true;
    if (chunks.length < 3) continue;
    const type = chunks[1];
    if (type !== 'dataset' && type !== 'topic') continue;
    const name = chunks[2] as string;
    if (!name) continue;
    if (type === 'dataset') {
      if (!filters[section].datasets) filters[section].datasets = [];
      filters[section].datasets.push(name);
      filters[section].enabled = true;
      continue;
    }
    const value = chunks[3] as string;
    if (!value) continue;
    if (type === 'topic') {
      if (!filters[section].topics) filters[section].topics = {};
      if (!filters[section].topics[name]) filters[section].topics[name] = [];
      filters[section].topics[name].push(value);
      filters[section].enabled = true;
    }
  }
  return filters;
}

export function getDatasetFromFilters(filters: ScreeningConfigBodyFiltersDto): string[] {
  return Object.entries(filters).flatMap(([dtoSection, data]) => {
    const section =
      DtoSectionToCategory[dtoSection as keyof ScreeningConfigBodyFiltersDto] ?? (dtoSection as ScreeningCategory);
    const sections = data.enabled ? [section] : [];
    const datasets = data.datasets?.map((dataset) => `${section}:dataset:${dataset}`) ?? [];
    const topics = Object.entries(data.topics ?? {}).flatMap(([topic, values]) => {
      return values.map((value) => `${section}:topic:${topic}:${value}`);
    });
    return [...sections, ...datasets, ...topics];
  });
}
