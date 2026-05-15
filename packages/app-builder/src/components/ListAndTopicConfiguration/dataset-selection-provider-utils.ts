import {
  ListAndTopicDatasetConfiguration,
  ListAndTopicDatasetConfigurationMode,
  ListAndTopicDatasetConfigurationVariant,
} from './context/ListAndTopicDatasetConfiguration';

export function makeDatasetsMap(selected: string[]): Record<string, boolean> {
  return Object.fromEntries(selected.map((name) => [name, true]));
}

export function useListAndTopicDatasetConfigurationSharp(params: {
  datasets: Record<string, boolean>;
  mode: ListAndTopicDatasetConfigurationMode;
  variant?: ListAndTopicDatasetConfigurationVariant;
}) {
  return ListAndTopicDatasetConfiguration.createSharp({
    datasets: params.datasets,
    mode: params.mode,
    variant: params.variant,
  });
}
