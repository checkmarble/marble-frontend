import { type ScreeningCategory, type ScreeningProviders } from '@app-builder/models/screening';
import { createSharpFactory } from 'sharpstate';

type ListAndTopicDatasetConfigurationMode = 'view' | 'edit' | 'create';
type ListAndTopicDatasetConfigurationVariant = 'default' | 'popover';

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
    requiredSectionKey: null as ScreeningCategory | null,
  }),
}).withActions({
  setMode(api, mode: ListAndTopicDatasetConfigurationMode) {
    api.value.mode = mode;
  },
});
