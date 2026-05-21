import {
  getCanonicalSelectedKeys,
  ListAndTopicDatasetConfiguration,
} from '@app-builder/components/ListAndTopicConfiguration';
import { type ReactNode, useEffect, useMemo } from 'react';
import { ContinuousScreeningConfigurationStepper } from './CreationStepper';

/* 
  this component is used to bridge the ListAndTopicDatasetConfiguration context with the ContinuousScreeningConfigurationStepper context
  to ensure that the datasets map is updated when the wizard mode changes
*/
function getDatasetsMapKey(datasets: Record<string, boolean>): string {
  return getCanonicalSelectedKeys(datasets).join(',');
}

export function ListAndTopicDatasetConfigurationBridge({ children }: { children: ReactNode }) {
  const wizard = ContinuousScreeningConfigurationStepper.useSharp();
  const wizardMode = ContinuousScreeningConfigurationStepper.select((s) => s.__internals.mode);
  const datasetsMap = wizard.value.data.datasets;
  const datasetsMapKey = useMemo(() => getDatasetsMapKey(datasetsMap), [datasetsMap]);

  const listSharp = ListAndTopicDatasetConfiguration.createSharp({
    datasets: datasetsMap,
    mode: wizardMode,
  });

  useEffect(() => {
    listSharp.actions.setMode(wizardMode);
  }, [listSharp, wizardMode]);

  useEffect(() => {
    const currentKey = getDatasetsMapKey(listSharp.value.datasets);
    if (currentKey === datasetsMapKey) return;

    const nextDatasets = { ...datasetsMap };
    listSharp.update((state) => {
      for (const key of Object.keys(state.datasets)) {
        delete state.datasets[key];
      }
      for (const key of Object.keys(nextDatasets)) {
        state.datasets[key] = !!nextDatasets[key];
      }
    });
  }, [listSharp, datasetsMap, datasetsMapKey]);

  return (
    <ListAndTopicDatasetConfiguration.Provider value={listSharp}>{children}</ListAndTopicDatasetConfiguration.Provider>
  );
}
