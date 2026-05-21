import type { ListConfigFilters } from '@app-builder/queries/screening/lists-config';

type SectionData = NonNullable<ListConfigFilters[keyof ListConfigFilters]>;

export function getSectionLeafNames(section: SectionData): string[] {
  const datasetNames = (section.datasets ?? []).flatMap((g) => g.datasets.map((d) => d.name));
  const topicNames = Object.values(section.topics ?? {}).flatMap((items) => items.map((i) => i.name));
  const conditionalTopicNames = Object.values(section.conditionalTopics ?? {}).flatMap((ct) =>
    ct.items.map((i) => i.name),
  );

  // Note: `sectionKey` is intentionally not included: it's the section toggle, not a leaf item.
  return [...new Set([...datasetNames, ...topicNames, ...conditionalTopicNames])];
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
