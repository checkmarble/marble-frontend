import {
  getCanonicalSelectedKeys,
  ListAndTopicDatasetConfiguration,
} from '@app-builder/components/ListAndTopicConfiguration';
import { Spinner } from '@app-builder/components/Spinner';
import { type AvailableFeatures, type ScreeningProviders } from '@app-builder/models/screening';
import { useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import { type ReactNode, useEffect, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { match } from 'ts-pattern';
import { ContinuousScreeningConfigurationStepper } from './CreationStepper';

/*
  this component is used to bridge the ListAndTopicDatasetConfiguration context with the ContinuousScreeningConfigurationStepper context
  to ensure that the datasets map is updated when the wizard mode changes
*/
function getDatasetsMapKey(datasets: Record<string, boolean>): string {
  return getCanonicalSelectedKeys(datasets).join(',');
}

export function ListAndTopicDatasetConfigurationBridge({
  useCase,
  children,
}: {
  useCase: AvailableFeatures;
  children: ReactNode;
}) {
  const listConfigQuery = useListConfigQuery(useCase);

  return match(listConfigQuery)
    .with({ isError: true }, () => (
      <div className="flex h-50 flex-col items-center justify-center gap-sm">
        <span className="text-s text-text-secondary">
          <Trans i18nKey="common:generic_fetch_data_error" />
        </span>
      </div>
    ))
    .with({ isPending: true }, () => (
      <div className="flex items-center justify-center h-50">
        <Spinner className="size-10" />
      </div>
    ))
    .otherwise(({ data }) => (
      <ListAndTopicDatasetConfigurationBridgeInner provider={data.provider}>
        {children}
      </ListAndTopicDatasetConfigurationBridgeInner>
    ));
}

function ListAndTopicDatasetConfigurationBridgeInner({
  provider,
  children,
}: {
  provider: ScreeningProviders;
  children: ReactNode;
}) {
  const wizard = ContinuousScreeningConfigurationStepper.useSharp();
  const wizardMode = ContinuousScreeningConfigurationStepper.select((s) => s.__internals.mode);
  const datasetsMap = wizard.value.data.datasets;
  const datasetsMapKey = useMemo(() => getDatasetsMapKey(datasetsMap), [datasetsMap]);

  const listSharp = ListAndTopicDatasetConfiguration.createSharp({
    datasets: datasetsMap,
    mode: wizardMode,
    provider,
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
