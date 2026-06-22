import { Callout } from '@app-builder/components/Callout';
import {
  DatasetSelectionContent,
  getCanonicalSelectedKeys,
  ListAndTopicDatasetConfiguration,
  makeDatasetsMap,
} from '@app-builder/components/ListAndTopicConfiguration';
import { Spinner } from '@app-builder/components/Spinner';
import { type ScreeningProviders } from '@app-builder/models/screening';
import { useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import { useSignalEffect } from '@preact/signals-react';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

function getDatasetsKey(datasets: string[]): string {
  return [...datasets].sort().join(',');
}

type FieldDatasetProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
  readOnly?: boolean;
};

export const FieldDataset = ({ value, onChange, readOnly = false }: FieldDatasetProps) => {
  const { t } = useTranslation();
  const listConfigQuery = useListConfigQuery('transaction_monitoring');

  return (
    <div className="flex flex-col gap-sm">
      <span className="text-s font-semibold">{t('scenarios:sanction.lists.title')}</span>
      <div className="bg-surface-card border-grey-border flex flex-col gap-md rounded-sm border p-md">
        <Callout variant="outlined">
          <p className="whitespace-pre-wrap">{t('scenarios:sanction.lists.callout')}</p>
        </Callout>
        {match(listConfigQuery)
          .with({ isPending: true }, () => (
            <div className="flex items-center justify-center h-50">
              <Spinner className="size-10" />
            </div>
          ))
          .with({ isError: true }, () => (
            <div className="flex flex-col gap-md items-center justify-center h-50">
              <div className="">{t('common:generic_fetch_data_error')}</div>
            </div>
          ))
          .otherwise(({ data }) => (
            <FieldDatasetInner provider={data.provider} value={value} onChange={onChange} readOnly={readOnly} />
          ))}
      </div>
    </div>
  );
};

const FieldDatasetInner = ({
  provider,
  value,
  onChange,
  readOnly,
}: {
  provider: ScreeningProviders;
} & FieldDatasetProps) => {
  const valueKey = useMemo(() => getDatasetsKey(value ?? []), [value]);

  const listSharp = ListAndTopicDatasetConfiguration.createSharp({
    datasets: makeDatasetsMap(value ?? []),
    mode: readOnly ? 'view' : 'edit',
    provider,
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
    <ListAndTopicDatasetConfiguration.Provider value={listSharp}>
      <DatasetSelectionContent useCase="transaction_monitoring" />
    </ListAndTopicDatasetConfiguration.Provider>
  );
};
