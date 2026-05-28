import { type ScreeningProviders } from '@app-builder/models/screening';
import { createSharpFactory } from 'sharpstate';

export type ListAndTopicDatasetConfigurationMode = 'view' | 'edit' | 'create';
export type ListAndTopicDatasetConfigurationVariant = 'default' | 'popover';

type ListAndTopicDatasetConfigurationParams = {
  datasets: Record<string, boolean>;
  mode: ListAndTopicDatasetConfigurationMode;
  provider: ScreeningProviders;
  variant?: ListAndTopicDatasetConfigurationVariant;
};

export const ListAndTopicDatasetConfiguration = createSharpFactory({
  name: 'ListAndTopicDatasetConfiguration',
  initializer: (params: ListAndTopicDatasetConfigurationParams) => ({
    datasets: params.datasets,
    mode: params.mode,
    provider: params.provider,
    variant: params.variant ?? 'default',
  }),
}).withActions({
  setMode(api, mode: ListAndTopicDatasetConfigurationMode) {
    api.value.mode = mode;
  },
});
