import type { ScreeningCategory } from '@app-builder/models/screening';
import type { ListConfigFilters } from '@app-builder/queries/screening/lists-config';

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

// Topics that are displyed as a switch button with a label
const SPECIAL_TOPICS: Record<string, TopicItem> = {
  kind: { name: 'pep.kind.primary', title: 'continuousScreening:topics.kind.primary' },
  status: { name: 'pep.status.active', title: 'continuousScreening:topics.status.exclude_inactive' },
} as const;

type SectionData = NonNullable<ListConfigFilters[keyof ListConfigFilters]>;

function getSpecialTopicConfig(groupKey: string) {
  const byKey = SPECIAL_TOPICS[groupKey.toLowerCase()];
  if (byKey) return byKey;
  return Object.values(SPECIAL_TOPICS).find((t) => formatTopicLabel(t.name) === groupKey);
}

export function isSpecialTopic(groupKey: string) {
  return getSpecialTopicConfig(groupKey) !== undefined;
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
export function sortTopicGroupEntries<T>(entries: [string, T][]): [string, T][] {
  return [...entries].sort(([keyA], [keyB]) => {
    const aSpecial = isSpecialTopic(keyA);
    const bSpecial = isSpecialTopic(keyB);
    if (aSpecial !== bSpecial) return aSpecial ? -1 : 1;
    return keyA.localeCompare(keyB, undefined, { sensitivity: 'base' });
  });
}

export function getSpecialTopicLabel(groupKey: string) {
  return getSpecialTopicConfig(groupKey)?.title;
}

export function getSpecialTopicValue(groupKey: string) {
  return getSpecialTopicConfig(groupKey)?.name ?? groupKey;
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

export function formatDatasetTitle(title: string): string {
  const last = title.includes(':')
    ? (title.split(':').at(-1) ?? title)
    : title.includes('.')
      ? (title.split('.').at(-1) ?? title)
      : title;
  return last.replace(/_/g, ' ');
}

export function formatTopicLabel(label: string) {
  return label.split('.').at(-1) ?? label;
}
