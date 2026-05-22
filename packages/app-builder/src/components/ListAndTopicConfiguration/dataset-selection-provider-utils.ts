import type { ScreeningCategory } from '@app-builder/models/screening';

const DTO_SECTION_TO_CATEGORY: Record<string, ScreeningCategory> = {
  adverse_media: 'adverse-media',
  other: 'third-parties',
};

export function buildDatasetKey(section: ScreeningCategory, datasetName: string): string {
  return `${section}:dataset:${datasetName}`;
}

export function buildTopicKey(section: ScreeningCategory, topicGroup: string, value: string): string {
  return `${section}:topic:${topicGroup}:${value}`;
}

/** Builds a UI lookup map from persisted selection keys (composite + section keys). */
export function makeDatasetsMap(selected: string[]): Record<string, boolean> {
  const map: Record<string, boolean> = {};

  for (const key of selected) {
    map[key] = true;

    const datasetMatch = key.match(/^([^:]+):dataset:(.+)$/);
    const datasetName = datasetMatch?.[2];
    if (datasetName) {
      map[datasetName] = true;
      continue;
    }

    const topicMatch = key.match(/^([^:]+):topic:[^:]+:(.+)$/);
    const topicValue = topicMatch?.[2];
    if (topicValue) {
      map[topicValue] = true;
      continue;
    }

    const category = DTO_SECTION_TO_CATEGORY[key];
    if (category) {
      map[category] = true;
    }
  }

  return map;
}

/** Returns selection keys suitable for `createScreeningFilters` (no bare aliases). */
export function getCanonicalSelectedKeys(datasets: Record<string, boolean>): string[] {
  const selected = Object.keys(datasets).filter((k) => datasets[k]);

  return selected
    .filter((key) => {
      if (key.includes(':')) return true;
      const hasDatasetComposite = selected.some((k) => k.endsWith(`:dataset:${key}`));
      const hasTopicComposite = selected.some((k) => {
        const match = k.match(/^[^:]+:topic:[^:]+:(.+)$/);
        return match?.[1] === key;
      });
      return !hasDatasetComposite && !hasTopicComposite;
    })
    .sort();
}

export function isDatasetKeySelected(
  datasets: Record<string, boolean>,
  sectionKey: ScreeningCategory,
  name: string,
): boolean {
  return !!(datasets[name] || datasets[buildDatasetKey(sectionKey, name)]);
}

export function setDatasetKey(
  datasets: Record<string, boolean>,
  sectionKey: ScreeningCategory,
  name: string,
  selected: boolean,
): void {
  datasets[name] = selected;
  datasets[buildDatasetKey(sectionKey, name)] = selected;
}

export function isTopicKeySelected(
  datasets: Record<string, boolean>,
  sectionKey: ScreeningCategory,
  topicGroup: string,
  value: string,
): boolean {
  const canonical = buildTopicKey(sectionKey, topicGroup, value);
  return !!(datasets[value] || datasets[canonical]);
}

export function setTopicKey(
  datasets: Record<string, boolean>,
  sectionKey: ScreeningCategory,
  topicGroup: string,
  value: string,
  selected: boolean,
): void {
  datasets[value] = selected;
  datasets[buildTopicKey(sectionKey, topicGroup, value)] = selected;
}

export function clearSectionSelections(
  datasets: Record<string, boolean>,
  sectionKey: ScreeningCategory,
  leafNames?: string[],
): void {
  datasets[sectionKey] = false;
  for (const key of Object.keys(datasets)) {
    if (key.startsWith(`${sectionKey}:`)) {
      datasets[key] = false;
    }
  }
  for (const name of leafNames ?? []) {
    datasets[name] = false;
  }
}
