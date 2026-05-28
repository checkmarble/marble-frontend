import { createSharpFactory } from 'sharpstate';

export type ListAndTopicDatasetConfigurationMode = 'view' | 'edit' | 'create';
export type ListAndTopicDatasetConfigurationVariant = 'default' | 'popover';

type ListAndTopicDatasetConfigurationParams = {
  datasets: Record<string, boolean>;
  mode: ListAndTopicDatasetConfigurationMode;
  variant?: ListAndTopicDatasetConfigurationVariant;
};

export const ListAndTopicDatasetConfiguration = createSharpFactory({
  name: 'ListAndTopicDatasetConfiguration',
  initializer: (params: ListAndTopicDatasetConfigurationParams) => ({
    datasets: params.datasets,
    mode: params.mode,
    variant: params.variant ?? 'default',
  }),
}).withActions({
  setMode(api, mode: ListAndTopicDatasetConfigurationMode) {
    api.value.mode = mode;
  },
});
