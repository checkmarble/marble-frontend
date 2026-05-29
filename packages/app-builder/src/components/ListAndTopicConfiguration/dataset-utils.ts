import type { ScreeningCategory } from '@app-builder/models/screening';
import type { ListConfigFilters } from '@app-builder/queries/screening/lists-config';
import { capitalize } from 'radash';
import { useTranslation } from 'react-i18next';

export type TopicItem = NonNullable<SectionData['topics']>[keyof NonNullable<SectionData['topics']>][number];

// All fields derived from listConfig.global.topics + conventions:
// - keys[0]: always persisted when the global topic switch is active
// - keys[1] / value: persisted when the switch is ON
// - label: `screenings:freeform_search.global.${groupKey}`
export type GlobalTopicConfig = {
  groupKey: string;
  keys: string[];
  value: string;
  label: string;
};

type SpecialTopicConfig = TopicItem & {
  section: ScreeningCategory;
  groupKey: string;
};

// Topics that are displayed as a switch button with a label.
// Scoped to a specific (section, group) pair: the same group key (e.g. "kind")
// can exist in multiple sections, so we match on both to avoid promoting
// unrelated groups (e.g. adverse-media's "kind") to a switch.
const SPECIAL_TOPICS: SpecialTopicConfig[] = [
  {
    section: 'peps',
    groupKey: 'kind',
    name: 'pep.kind.primary',
    title: 'continuousScreening:topics.kind.primary',
  },
  {
    section: 'peps',
    groupKey: 'status',
    name: 'pep.status.active',
    title: 'continuousScreening:topics.status.exclude_inactive',
  },
];

type SectionData = NonNullable<ListConfigFilters[keyof ListConfigFilters]>;

function getSpecialTopicConfig(sectionKey: ScreeningCategory, groupKey: string) {
  const normalized = groupKey.toLowerCase();
  return SPECIAL_TOPICS.find((t) => t.section === sectionKey && t.groupKey === normalized);
}

export function isSpecialTopic(sectionKey: ScreeningCategory, groupKey: string) {
  return getSpecialTopicConfig(sectionKey, groupKey) !== undefined;
}

function buildGlobalTopicConfig(groupKey: string, items: TopicItem[]): GlobalTopicConfig {
  const keys = items.map((i) => i.name);
  return {
    groupKey,
    keys,
    value: keys[1] ?? '',
    label: `screenings:freeform_search.global.${groupKey}`,
  };
}

export function getAvailableGlobalTopicConfigs(listConfig: ListConfigFilters): GlobalTopicConfig[] {
  const globalTopics = listConfig.global?.topics;
  if (!globalTopics) return [];
  return Object.entries(globalTopics)
    .filter(([, items]) => items.length >= 2)
    .map(([groupKey, items]) => buildGlobalTopicConfig(groupKey, items));
}

// sort topics to put the switch button topics at the top
export function sortTopicGroupEntries<T>(sectionKey: ScreeningCategory, entries: [string, T][]): [string, T][] {
  return [...entries].sort(([keyA], [keyB]) => {
    const aSpecial = isSpecialTopic(sectionKey, keyA);
    const bSpecial = isSpecialTopic(sectionKey, keyB);
    if (aSpecial !== bSpecial) return aSpecial ? -1 : 1;
    return keyA.localeCompare(keyB, undefined, { sensitivity: 'base' });
  });
}

export function getSpecialTopicLabel(sectionKey: ScreeningCategory, groupKey: string) {
  return getSpecialTopicConfig(sectionKey, groupKey)?.title;
}

export function getSpecialTopicValue(sectionKey: ScreeningCategory, groupKey: string) {
  return getSpecialTopicConfig(sectionKey, groupKey)?.name ?? groupKey;
}

/** Returns the set of composite wire keys for every leaf item (dataset + topic + conditional topic) in a section. */
export function getSectionLeafKeys(section: SectionData, sectionKey: ScreeningCategory): string[] {
  const datasetKeys = (section.datasets ?? []).flatMap((g) => g.datasets.map((d) => `${sectionKey}:dataset:${d.name}`));
  const topicKeys = Object.entries(section.topics ?? {}).flatMap(([group, items]) =>
    items.map((i) => `${sectionKey}:topic:${group}:${i.name}`),
  );
  const conditionalTopicKeys = Object.entries(section.conditionalTopics ?? {}).flatMap(([group, ct]) =>
    ct.items.map((i) => `${sectionKey}:topic:${group}:${i.name}`),
  );
  return [...new Set([...datasetKeys, ...topicKeys, ...conditionalTopicKeys])];
}

export function getDatasetNames(section: SectionData) {
  return (section.datasets ?? []).flatMap((g) => g.datasets.map((d) => d.name));
}

const FILTER_TRANSLATION_MAP = {
  'filter.pep.category.govt_branch_member': 'continuousScreening:filter.pep.category.govt_branch_member',
  'filter.pep.category.family_member': 'continuousScreening:filter.pep.category.family_member',
  'filter.pep.category.manager_state_owned_enterprise':
    'continuousScreening:filter.pep.category.manager_state_owned_enterprise',
  'filter.pep.category.legislature': 'continuousScreening:filter.pep.category.legislature',
  'filter.pep.category.state_owned_enterprise': 'continuousScreening:filter.pep.category.state_owned_enterprise',
  'filter.pep.category.diplomat': 'continuousScreening:filter.pep.category.diplomat',
  'filter.pep.category.judiciary': 'continuousScreening:filter.pep.category.judiciary',
  'filter.pep.category.senior_party_member': 'continuousScreening:filter.pep.category.senior_party_member',
  'filter.pep.category.associate': 'continuousScreening:filter.pep.category.associate',
  'filter.pep.category.pep_controlled_business': 'continuousScreening:filter.pep.category.pep_controlled_business',
  'filter.pep.category.intl_org_leadership': 'continuousScreening:filter.pep.category.intl_org_leadership',
  'filter.pep.category.military': 'continuousScreening:filter.pep.category.military',
  'filter.pep.category.law_enforce_authority': 'continuousScreening:filter.pep.category.law_enforce_authority',
  'filter.pep.category.ngo_leadership': 'continuousScreening:filter.pep.category.ngo_leadership',
  'filter.pep.category.chief_of_state': 'continuousScreening:filter.pep.category.chief_of_state',
  'filter.pep.category.intelligence': 'continuousScreening:filter.pep.category.intelligence',
  'filter.pep.category.manager_sovereign_wealth_fund':
    'continuousScreening:filter.pep.category.manager_sovereign_wealth_fund',
  'filter.pep.category.traditional_leadership': 'continuousScreening:filter.pep.category.traditional_leadership',
  'filter.pep.category.union_leadership': 'continuousScreening:filter.pep.category.union_leadership',
  'filter.pep.category.attorney': 'continuousScreening:filter.pep.category.attorney',
  'filter.alive': 'continuousScreening:filter.alive',
  'filter.deceased': 'continuousScreening:filter.deceased',
  eu: 'continuousScreening:dataset.eu',
  as: 'continuousScreening:dataset.as',
  oc: 'continuousScreening:dataset.oc',
  af: 'continuousScreening:dataset.af',
  na: 'continuousScreening:dataset.na',
  sa: 'continuousScreening:dataset.sa',
  un: 'continuousScreening:dataset.un',
} as const;

export function useDatasetTitle() {
  const { t } = useTranslation('continuousScreening');

  function formatDatasetTitle(title: string) {
    const last = title.includes(':')
      ? (title.split(':').at(-1) ?? title)
      : title.includes('.')
        ? (title.split('.').at(-1) ?? title)
        : title;

    const translation = hasTranslation(last);
    if (translation) return t(translation);
    return capitalize(last.replace(/_/g, ' '));
  }

  function formatTopicLabel(label: string) {
    return label.split('.').at(-1) ?? label;
  }

  function hasTranslation(key: string) {
    const hasKey = Object.keys(FILTER_TRANSLATION_MAP).includes(key);
    return hasKey ? FILTER_TRANSLATION_MAP[key as keyof typeof FILTER_TRANSLATION_MAP] : undefined;
  }

  function formatItemName(item: { name: string; title?: string }): string {
    const label = item.title ?? item.name;
    const translation = hasTranslation(label);
    if (translation) return t(translation);

    const last = label.split('.').at(-1) ?? label;
    return capitalize(last);
  }

  return { formatDatasetTitle, formatTopicLabel, hasTranslation, formatItemName, t };
}
