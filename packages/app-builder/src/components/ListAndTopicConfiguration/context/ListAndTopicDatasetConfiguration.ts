import { createSharpFactory } from 'sharpstate';

export type ListAndTopicDatasetConfigurationMode = 'view' | 'edit' | 'create';

type ListAndTopicDatasetConfigurationParams = {
  datasets: Record<string, boolean>;
  mode: ListAndTopicDatasetConfigurationMode;
};

export const ListAndTopicDatasetConfiguration = createSharpFactory({
  name: 'ListAndTopicDatasetConfiguration',
  initializer: (params: ListAndTopicDatasetConfigurationParams) => ({
    datasets: params.datasets,
    mode: params.mode,
  }),
}).withActions({
  setMode(api, mode: ListAndTopicDatasetConfigurationMode) {
    api.value.mode = mode;
  },
});
