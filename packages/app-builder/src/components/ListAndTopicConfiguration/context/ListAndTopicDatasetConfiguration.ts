import { createSharpFactory } from 'sharpstate';

export type ListAndTopicDatasetConfigurationMode = 'view' | 'edit' | 'create';
export type ListAndTopicDatasetConfigurationVariant = 'default' | 'popover';

type ListAndTopicDatasetConfigurationParams = {
  datasets: Record<string, boolean>;
  mode: ListAndTopicDatasetConfigurationMode;
  variant?: ListAndTopicDatasetConfigurationVariant;
  withGlobalTopics?: boolean;
};

export const ListAndTopicDatasetConfiguration = createSharpFactory({
  name: 'ListAndTopicDatasetConfiguration',
  initializer: (params: ListAndTopicDatasetConfigurationParams) => ({
    datasets: params.datasets,
    mode: params.mode,
    variant: params.variant ?? 'default',
    withGlobalTopics: params.withGlobalTopics ?? true,
  }),
}).withActions({
  setMode(api, mode: ListAndTopicDatasetConfigurationMode) {
    api.value.mode = mode;
  },
});
