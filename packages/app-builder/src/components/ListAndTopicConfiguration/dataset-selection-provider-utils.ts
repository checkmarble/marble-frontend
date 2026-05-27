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
    .filter((key) => key !== 'global')
    .filter((key) => {
      const globalTopicMatch = key.match(/^global:topic:[^:]+:(.+)$/);
      if (globalTopicMatch?.[1] && selected.includes(globalTopicMatch[1])) {
        return false;
      }
      return true;
    })
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

function getDefaultGlobalTopicItemName(config: GlobalTopicConfig): string | undefined {
  return config.keys[0];
}

function getSwitchGlobalTopicItemName(config: GlobalTopicConfig): string | undefined {
  return config.keys[1] ?? config.value;
}

function clearGlobalTopicSelection(datasets: Record<string, boolean>, config: GlobalTopicConfig): void {
  delete datasets['global'];

  for (const key of config.keys) {
    delete datasets[key];
    delete datasets[buildTopicKey('global', config.groupKey, key)];
  }
}

function hasGlobalTopicEngagement(datasets: Record<string, boolean>, config: GlobalTopicConfig): boolean {
  return config.keys.some(
    (key) => !!datasets[key] || !!datasets[buildTopicKey('global', config.groupKey, key)] || datasets['global'],
  );
}

export function isGlobalTopicSwitchSelected(
  datasets: Record<string, boolean>,
  config: GlobalTopicConfig,
  listConfig: ListConfigFilters,
): boolean {
  if (!listConfig.global?.topics?.[config.groupKey]) return false;
  const switchItemName = getSwitchGlobalTopicItemName(config);
  if (!switchItemName) return false;
  return !!datasets[switchItemName];
}

export function setGlobalTopicSwitch(
  datasets: Record<string, boolean>,
  config: GlobalTopicConfig,
  checked: boolean,
  listConfig: ListConfigFilters,
): void {
  if (!listConfig.global?.topics?.[config.groupKey]) return;
  const defaultItemName = getDefaultGlobalTopicItemName(config);
  const switchItemName = getSwitchGlobalTopicItemName(config);
  if (!defaultItemName || !switchItemName) return;

  clearGlobalTopicSelection(datasets, config);

  datasets[defaultItemName] = true;

  if (checked) {
    datasets[switchItemName] = true;
  }
}

export function completeGlobalTopicSelections(datasets: Record<string, boolean>, listConfig: ListConfigFilters): void {
  for (const config of getAvailableGlobalTopicConfigs(listConfig)) {
    if (!hasGlobalTopicEngagement(datasets, config)) continue;
    const checked = isGlobalTopicSwitchSelected(datasets, config, listConfig);
    setGlobalTopicSwitch(datasets, config, checked, listConfig);
  }
}

export function expandSelectionWithGlobalTopicFilterKeys(selection: string[], listConfig: ListConfigFilters): string[] {
  const globalConfigs = getAvailableGlobalTopicConfigs(listConfig);
  const globalBareKeys = new Set(globalConfigs.flatMap((config) => config.keys));

  const nonGlobalBareKeys = selection.filter((key) => !globalBareKeys.has(key));
  const globalFilterKeys = globalConfigs.flatMap((config) =>
    config.keys.filter((key) => selection.includes(key)).map((key) => buildTopicKey('global', config.groupKey, key)),
  );

  return [...nonGlobalBareKeys, ...globalFilterKeys].sort();
}

/** Strips falsy entries from the datasets map before persistence. */
export function sanitizeTruthyDatasets(datasets: Record<string, boolean>): Record<string, boolean> {
  return Object.fromEntries(Object.entries(datasets).filter(([, selected]) => selected));
}
