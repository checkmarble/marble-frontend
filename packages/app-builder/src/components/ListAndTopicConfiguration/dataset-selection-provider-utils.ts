import type { AvailableFeatures, ScreeningCategory } from '@app-builder/models/screening';
import type { ListConfigFilters } from '@app-builder/queries/screening/lists-config';
import { type GlobalTopicConfig } from './dataset-utils';

export function buildDatasetKey(section: ScreeningCategory, datasetName: string): string {
  return `${section}:dataset:${datasetName}`;
}

export function buildTopicKey(section: ScreeningCategory, topicGroup: string, value: string): string {
  return `${section}:topic:${topicGroup}:${value}`;
}

/**
 * Builds the UI selection map from persisted composite keys. The bare `'global'`
 * section key is dropped: the global bucket is implicit on the wire (enabled
 * automatically by `createScreeningFilters` when any global topic is present).
 */
export function makeDatasetsMap(selected: string[]): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  for (const key of selected) {
    if (key === 'global') continue;
    map[key] = true;
  }
  return map;
}

/** Returns selection keys for the wire payload. State is already composite, so this is just a truthy filter. */
export function getCanonicalSelectedKeys(datasets: Record<string, boolean>): string[] {
  return Object.keys(datasets)
    .filter((key) => datasets[key] && key !== 'global')
    .sort();
}

export function isDatasetKeySelected(
  datasets: Record<string, boolean>,
  sectionKey: ScreeningCategory,
  name: string,
): boolean {
  return !!datasets[buildDatasetKey(sectionKey, name)];
}

export function setDatasetKey(
  datasets: Record<string, boolean>,
  sectionKey: ScreeningCategory,
  name: string,
  selected: boolean,
): void {
  datasets[buildDatasetKey(sectionKey, name)] = selected;
}

export function isTopicKeySelected(
  datasets: Record<string, boolean>,
  sectionKey: ScreeningCategory,
  topicGroup: string,
  value: string,
): boolean {
  return !!datasets[buildTopicKey(sectionKey, topicGroup, value)];
}

export function setTopicKey(
  datasets: Record<string, boolean>,
  sectionKey: ScreeningCategory,
  topicGroup: string,
  value: string,
  selected: boolean,
): void {
  datasets[buildTopicKey(sectionKey, topicGroup, value)] = selected;
}

export function clearSectionSelections(datasets: Record<string, boolean>, sectionKey: ScreeningCategory): void {
  datasets[sectionKey] = false;
  for (const key of Object.keys(datasets)) {
    if (key.startsWith(`${sectionKey}:`)) {
      datasets[key] = false;
    }
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

export function isGlobalTopicSwitchSelected(datasets: Record<string, boolean>, config: GlobalTopicConfig): boolean {
  const switchKey = config.keys[1];
  if (!switchKey) return false;
  return !!datasets[buildTopicKey('global', config.groupKey, switchKey)];
}

/**
 * Encodes the global topic invariant in one place: `keys[0]` is always selected
 * when the group is engaged, `keys[1]` follows the switch. Never writes the
 * bare `'global'` section key — the global bucket is implicit on the wire.
 */
export function setGlobalTopicSwitch(
  datasets: Record<string, boolean>,
  config: GlobalTopicConfig,
  checked: boolean,
): void {
  const defaultKey = config.keys[0];
  const switchKey = config.keys[1];
  if (!defaultKey || !switchKey) return;

  datasets[buildTopicKey('global', config.groupKey, defaultKey)] = true;
  datasets[buildTopicKey('global', config.groupKey, switchKey)] = checked;
}

/** Strips falsy entries from the datasets map before persistence. */
export function sanitizeTruthyDatasets(datasets: Record<string, boolean>): Record<string, boolean> {
  return Object.fromEntries(Object.entries(datasets).filter(([, selected]) => selected));
}

const ALIVE_ITEM_NAME = 'filter.alive';
const DECEASED_ITEM_NAME = 'filter.deceased';

/**
 * Default `filter.alive` to true whenever a global topic group exposes it, and additionally
 * default `filter.deceased` to true for manual search. Skipped once the group has been
 * engaged (the alive key is in the map) so the user's prior choice — including a
 * deliberate deceased=false that drops out of the truthy-only wire format — is preserved.
 */
export function applyAliveDeceasedDefaults(
  datasets: Record<string, boolean>,
  listConfig: ListConfigFilters,
  useCase: AvailableFeatures,
): void {
  const globalTopics = listConfig.global?.topics;
  if (!globalTopics) return;

  for (const [groupKey, items] of Object.entries(globalTopics)) {
    if (!items.some((i) => i.name === ALIVE_ITEM_NAME)) continue;

    const aliveKey = buildTopicKey('global', groupKey, ALIVE_ITEM_NAME);
    if (aliveKey in datasets) continue;

    datasets[aliveKey] = true;

    if (useCase === 'manual_search' && items.some((i) => i.name === DECEASED_ITEM_NAME)) {
      datasets[buildTopicKey('global', groupKey, DECEASED_ITEM_NAME)] = true;
    }
  }
}
