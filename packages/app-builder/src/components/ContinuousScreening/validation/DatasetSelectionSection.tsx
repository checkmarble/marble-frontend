import { ScreeningCategory } from '@app-builder/models/screening';
import { useScreeningDatasetsQuery } from '@app-builder/queries/screening/datasets';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { match } from 'ts-pattern';
import { ButtonV2, Collapsible } from 'ui-design-system';
import { DatasetTag } from '../../Screenings/DatasetTag';
import { Spinner } from '../../Spinner';
import { EditionValidationPanelProps } from '../EditionValidationPanel';

export const DatasetSelectionSection = ({ updatedConfig, baseConfig }: EditionValidationPanelProps) => {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const datasetsQuery = useScreeningDatasetsQuery();
  const addedDatasets = Object.keys(updatedConfig.datasets).filter(
    (k) => !!updatedConfig.datasets[k] && !baseConfig.datasets.includes(k),
  );
  const removedDatasets = baseConfig.datasets.filter((k) => !updatedConfig.datasets[k]);

  return (
    <Collapsible.Container>
      <Collapsible.Title>{t('continuousScreening:edition.validation.datasetSelection.title')}</Collapsible.Title>
      <Collapsible.Content>
        {match(datasetsQuery)
          .with({ isPending: true }, () => (
            <div className="flex items-center justify-center h-50">
              <Spinner className="size-10" />
            </div>
          ))
          .with({ isError: true }, () => (
            <div className="flex flex-col gap-v2-md items-center justify-center h-50">
              <div className="">{t('common:generic_fetch_data_error')}</div>
              <ButtonV2 variant="secondary" onClick={() => datasetsQuery.refetch()}>
                {t('common:retry')}
              </ButtonV2>
            </div>
          ))
          .with({ isSuccess: true }, ({ data: { datasets } }) => {
            const datasetsArray = R.pipe(
              datasets.sections,
              R.flatMap(R.prop('datasets')),
              R.map((d) => ({ name: d.name, tag: d.tag, title: d.title })),
            );

            return (
              <div className="grid grid-cols-2 gap-v2-md">
                <div className="flex flex-col gap-v2-sm">
                  <span>{t('continuousScreening:edition.validation.datasetSelection.added.title')}</span>
                  <div className="flex flex-col gap-v2-sm border border-grey-border rounded-v2-md p-v2-md max-h-50 overflow-y-auto">
                    {addedDatasets.map((k) => {
                      const dataset = datasetsArray.find((d) => d.name === k);
                      return (
                        <div key={k} className="flex items-center justify-between gap-v2-sm">
                          <span>{dataset?.title ?? k}</span>
                          {dataset ? <DatasetTag category={dataset.tag as ScreeningCategory} /> : null}
                        </div>
                      );
                    })}
                    {addedDatasets.length === 0 && (
                      <span className="text-grey-secondary text-center">
                        {t('continuousScreening:edition.validation.datasetSelection.no_added')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-v2-sm">
                  <span>{t('continuousScreening:edition.validation.datasetSelection.removed.title')}</span>
                  <div className="flex flex-col gap-v2-sm border border-grey-border rounded-v2-md p-v2-md max-h-50 overflow-y-auto">
                    {removedDatasets.map((k) => {
                      const dataset = datasetsArray.find((d) => d.name === k);
                      return (
                        <div key={k} className="flex items-center justify-between gap-v2-sm">
                          <span>{dataset?.title ?? k}</span>
                          {dataset ? <DatasetTag category={dataset.tag as ScreeningCategory} /> : null}
                        </div>
                      );
                    })}
                    {removedDatasets.length === 0 && (
                      <span className="text-grey-secondary text-center">
                        {t('continuousScreening:edition.validation.datasetSelection.no_removed')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
          .exhaustive()}
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
