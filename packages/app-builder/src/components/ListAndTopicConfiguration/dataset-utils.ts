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

export function getSectionLeafNames(section: SectionData) {
  const datasetNames = getDatasetNames(section);
  const topicNames = Object.values(section.topics ?? {}).flatMap((items) => items.map((i) => i.name));
  const conditionalTopicNames = Object.values(section.conditionalTopics ?? {}).flatMap((ct) =>
    ct.items.map((i) => i.name),
  );

  // Note: `sectionKey` is intentionally not included: it's the section toggle, not a leaf item.
  return [...new Set([...datasetNames, ...topicNames, ...conditionalTopicNames])];
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
