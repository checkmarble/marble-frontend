import { ListAndTopicDatasetConfiguration } from '@app-builder/components/ListAndTopicConfiguration';
import { type ReactNode, useEffect } from 'react';
import { ContinuousScreeningConfigurationStepper } from './CreationStepper';

/* 
  this component is used to bridge the ListAndTopicDatasetConfiguration context with the ContinuousScreeningConfigurationStepper context
  to ensure that the datasets map is updated when the wizard mode changes
*/
export function ListAndTopicDatasetConfigurationBridge({ children }: { children: ReactNode }) {
  const wizard = ContinuousScreeningConfigurationStepper.useSharp();
  const wizardMode = ContinuousScreeningConfigurationStepper.select((s) => s.__internals.mode);
  const datasetsMap = wizard.value.data.datasets;
  const listSharp = ListAndTopicDatasetConfiguration.createSharp({
    datasets: datasetsMap,
    mode: wizardMode,
  });

  useEffect(() => {
    listSharp.actions.setMode(wizardMode);
  }, [listSharp, wizardMode]);

  return (
    <ListAndTopicDatasetConfiguration.Provider value={listSharp}>{children}</ListAndTopicDatasetConfiguration.Provider>
  );
}
