import { Callout } from '@app-builder/components/Callout';
import {
  DatasetSelectionContent,
  ListAndTopicDatasetConfiguration,
  makeDatasetsMap,
} from '@app-builder/components/ListAndTopicConfiguration';
import { useSignalEffect } from '@preact/signals-react';
import { type OpenSanctionsCatalogSection } from 'marble-api';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const FieldDataset = ({
  onChange,
  onBlur: _onBlur,
  sections: _sections,
  defaultValue,
}: {
  defaultValue?: string[];
  sections: OpenSanctionsCatalogSection[];
  onChange?: (value: string[]) => void;
  onBlur?: () => void;
}) => {
  const { t } = useTranslation();

  const listSharp = ListAndTopicDatasetConfiguration.createSharp({
    datasets: makeDatasetsMap(defaultValue ?? []),
    mode: 'edit',
  });

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const isFirstRender = useRef(true);

  // useSignalEffect runs inside a preact signal effect (not React's render
  // cycle). When dataset signals change, fn fires and calls onChange without
  // going through React's state/render loop, so there is no feedback cycle.
  useSignalEffect(() => {
    const key = Object.keys(listSharp.value.datasets)
      .filter((k) => listSharp.value.datasets[k])
      .sort()
      .join(',');

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    onChangeRef.current?.(key === '' ? [] : key.split(','));
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
