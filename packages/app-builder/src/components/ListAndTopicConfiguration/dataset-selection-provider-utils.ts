import { ListAndTopicDatasetConfiguration } from './context/ListAndTopicDatasetConfiguration';

export function makeDatasetsMap(selected: string[]): Record<string, boolean> {
  return Object.fromEntries(selected.map((name) => [name, true]));
}

export function useListAndTopicDatasetConfigurationSharp(params: {
  datasets: Record<string, boolean>;
  mode: 'view' | 'edit' | 'create';
}) {
  return ListAndTopicDatasetConfiguration.createSharp({
    datasets: params.datasets,
    mode: params.mode,
  });
}
