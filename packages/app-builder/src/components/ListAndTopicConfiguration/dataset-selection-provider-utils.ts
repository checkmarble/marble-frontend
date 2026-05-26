import type { ScreeningCategory } from '@app-builder/models/screening';
import type { ListConfigFilters } from '@app-builder/queries/screening/lists-config';
import { type GlobalTopicConfig, getAvailableGlobalTopicConfigs } from './dataset-utils';

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

export function syncSharpDatasets(datasets: Record<string, boolean>, selected: string[]): void {
  const nextDatasets = makeDatasetsMap(selected);

  for (const key of Object.keys(datasets)) {
    delete datasets[key];
  }
  for (const [key, isSelected] of Object.entries(nextDatasets)) {
    datasets[key] = isSelected;
  }
}

function getInactiveGlobalTopicItemName(config: GlobalTopicConfig): string | undefined {
  return config.keys.find((key) => key !== config.value);
}

export function isGlobalTopicSwitchSelected(
  datasets: Record<string, boolean>,
  config: GlobalTopicConfig,
  listConfig: ListConfigFilters,
): boolean {
  for (const [sectionKey, section] of Object.entries(listConfig)) {
    if (!section?.topics?.[config.groupKey]) continue;
    if (isTopicKeySelected(datasets, sectionKey as ScreeningCategory, config.groupKey, config.value)) {
      return true;
    }
  }
  return false;
}

export function setGlobalTopicSwitch(
  datasets: Record<string, boolean>,
  config: GlobalTopicConfig,
  checked: boolean,
  listConfig: ListConfigFilters,
): void {
  const activeItemName = checked ? config.value : getInactiveGlobalTopicItemName(config);
  const inactiveItemName = checked ? getInactiveGlobalTopicItemName(config) : config.value;
  if (!activeItemName || !inactiveItemName) return;

  for (const [sectionKey, section] of Object.entries(listConfig)) {
    if (!section?.topics?.[config.groupKey]) continue;
    const category = sectionKey as ScreeningCategory;
    setTopicKey(datasets, category, config.groupKey, activeItemName, true);
    setTopicKey(datasets, category, config.groupKey, inactiveItemName, false);
    datasets[category] = true;
  }
}

export function completeGlobalTopicSelections(datasets: Record<string, boolean>, listConfig: ListConfigFilters): void {
  for (const config of getAvailableGlobalTopicConfigs(listConfig)) {
    const checked = isGlobalTopicSwitchSelected(datasets, config, listConfig);
    setGlobalTopicSwitch(datasets, config, checked, listConfig);
  }
}
