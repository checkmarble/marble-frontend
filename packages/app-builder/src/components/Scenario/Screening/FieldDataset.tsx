import { Callout } from '@app-builder/components/Callout';
import {
  DatasetSelectionContent,
  getCanonicalSelectedKeys,
  ListAndTopicDatasetConfiguration,
  makeDatasetsMap,
} from '@app-builder/components/ListAndTopicConfiguration';
import { useSignalEffect } from '@preact/signals-react';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

function getDatasetsKey(datasets: string[]): string {
  return [...datasets].sort().join(',');
}

export const FieldDataset = ({ value, onChange }: { value?: string[]; onChange?: (value: string[]) => void }) => {
  const { t } = useTranslation();
  const valueKey = useMemo(() => getDatasetsKey(value ?? []), [value]);

  const listSharp = ListAndTopicDatasetConfiguration.createSharp({
    datasets: makeDatasetsMap(value ?? []),
    mode: 'edit',
  });

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastValueKeyRef = useRef(valueKey);
  lastValueKeyRef.current = valueKey;

  useEffect(() => {
    const selectedKey = getDatasetsKey(getCanonicalSelectedKeys(listSharp.value.datasets));
    if (selectedKey === valueKey) return;

    const nextDatasets = makeDatasetsMap(value ?? []);
    listSharp.update((state) => {
      for (const key of Object.keys(state.datasets)) {
        delete state.datasets[key];
      }
      for (const [key, isSelected] of Object.entries(nextDatasets)) {
        state.datasets[key] = isSelected;
      }
    });
  }, [listSharp, value, valueKey]);

  useSignalEffect(() => {
    const selectedDatasets = getCanonicalSelectedKeys(listSharp.value.datasets);
    const selectedKey = getDatasetsKey(selectedDatasets);

    if (selectedKey === lastValueKeyRef.current) {
      return;
    }

    lastValueKeyRef.current = selectedKey;
    onChangeRef.current?.(selectedDatasets);
  });

  return (
    <div className="flex flex-col gap-2">
      <span className="text-s font-semibold">{t('scenarios:sanction.lists.title')}</span>
      <div className="bg-surface-card border-grey-border flex flex-col gap-4 rounded-sm border p-4">
        <Callout variant="outlined">
          <p className="whitespace-pre-wrap">{t('scenarios:sanction.lists.callout')}</p>
        </Callout>
        <ListAndTopicDatasetConfiguration.Provider value={listSharp}>
          <DatasetSelectionContent useCase="transaction_monitoring" />
        </ListAndTopicDatasetConfiguration.Provider>
      </div>
    </div>
  );
};
