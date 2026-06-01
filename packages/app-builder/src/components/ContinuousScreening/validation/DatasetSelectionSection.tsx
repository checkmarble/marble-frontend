import {
  findDatasetOrTopicByKey,
  useDatasetTitle,
} from '@app-builder/components/ListAndTopicConfiguration/dataset-utils';
import type { ScreeningAvailableFiltersAdapted, ScreeningCategory } from '@app-builder/models/screening';
import { SCREENING_CATEGORY_TO_DTO_SECTION } from '@app-builder/models/screening-config';
import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';
import { DatasetTag } from '../../Screenings/DatasetTag';
import { EditionValidationPanelBaseProps } from '../EditionValidationPanel';

function getSectionFromKey(key: string): ScreeningCategory | undefined {
  const section = key.split(':')[0];
  if (!section || !(section in SCREENING_CATEGORY_TO_DTO_SECTION)) return undefined;
  return section as ScreeningCategory;
}

function DatasetChangeList({
  keys,
  catalog,
  emptyLabel,
}: {
  keys: string[];
  catalog: ScreeningAvailableFiltersAdapted;
  emptyLabel: string;
}) {
  const { formatItemName } = useDatasetTitle();
  const rows = keys.flatMap((key) => {
    const item = findDatasetOrTopicByKey(catalog, key);
    if (!item) return [];

    const category = getSectionFromKey(key);
    return (
      <div key={key} className="flex items-center justify-between gap-v2-sm">
        <span className="truncate">{formatItemName(item)}</span>
        {category ? <DatasetTag category={category} /> : null}
      </div>
    );
  });

  if (rows.length === 0) {
    return <span className="text-grey-secondary text-center">{emptyLabel}</span>;
  }

  return rows;
}

type DatasetSelectionSectionProps = EditionValidationPanelBaseProps & {
  datasets: ScreeningAvailableFiltersAdapted;
};

export const DatasetSelectionSection = ({ updatedConfig, baseConfig, datasets }: DatasetSelectionSectionProps) => {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const addedDatasets = Object.keys(updatedConfig.datasets).filter(
    (k) => !!updatedConfig.datasets[k] && !baseConfig.datasets.includes(k),
  );
  const removedDatasets = baseConfig.datasets.filter((k) => !updatedConfig.datasets[k]);

  return (
    <Collapsible.Container>
      <Collapsible.Title>{t('continuousScreening:edition.validation.datasetSelection.title')}</Collapsible.Title>
      <Collapsible.Content>
        <div className="grid grid-cols-2 gap-v2-md">
          <div className="flex flex-col gap-v2-sm">
            <span>{t('continuousScreening:edition.validation.datasetSelection.added.title')}</span>
            <div className="flex flex-col gap-v2-sm border border-grey-border rounded-v2-md p-v2-md max-h-50 overflow-y-auto">
              <DatasetChangeList
                keys={addedDatasets}
                catalog={datasets}
                emptyLabel={t('continuousScreening:edition.validation.datasetSelection.no_added')}
              />
            </div>
          </div>
          <div className="flex flex-col gap-v2-sm">
            <span>{t('continuousScreening:edition.validation.datasetSelection.removed.title')}</span>
            <div className="flex flex-col gap-v2-sm border border-grey-border rounded-v2-md p-v2-md max-h-50 overflow-y-auto">
              <DatasetChangeList
                keys={removedDatasets}
                catalog={datasets}
                emptyLabel={t('continuousScreening:edition.validation.datasetSelection.no_removed')}
              />
            </div>
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
