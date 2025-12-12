import { useScreeningDatasetsQuery } from '@app-builder/queries/screening/datasets';
import { OpenSanctionsCatalogSection } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ContinuousScreeningCreationStepper } from '../../context/CreationStepper';
import { RecapCapsule, RecapRow } from '../../shared/RecapRow';

const calculateSelectedCountByTags = (sections: OpenSanctionsCatalogSection[], selectedDatasets: string[]) => {
  const flatDatasets = sections.flatMap((section) => section.datasets);
  const selectedCountByTags: Record<string, number> = {};

  selectedDatasets.forEach((datasetName) => {
    const dataset = flatDatasets.find((d) => d.name === datasetName);
    if (dataset) {
      const datasetTag = dataset.tag ? dataset.tag : 'unknown';
      selectedCountByTags[datasetTag] = (selectedCountByTags[datasetTag] ?? 0) + 1;
    }
  });

  return selectedCountByTags;
};

export const DatasetSelectionRecap = () => {
  const { t } = useTranslation(['continuousScreening', 'scenarios']);
  const datasetsQuery = useScreeningDatasetsQuery();
  const selectedDatasets = ContinuousScreeningCreationStepper.select((state) =>
    Object.keys(state.data.datasets).filter((k) => !!state.data.datasets[k]),
  );

  return (
    <RecapRow>
      <span>{t('continuousScreening:creation.datasetSelection.recap.title', { count: selectedDatasets.length })}</span>
      {match(datasetsQuery)
        .with({ isPending: true }, () => <div>Loading...</div>)
        .with({ isError: true }, () => <div>Error</div>)
        .with({ isSuccess: true }, ({ data }) => {
          const selectedCountByTags = calculateSelectedCountByTags(data.datasets.sections, selectedDatasets);
          const entries = Object.entries(selectedCountByTags);

          return (
            <div className="flex flex-row items-center gap-v2-xs">
              {entries.map(([tag, count]) => (
                <RecapCapsule key={tag}>
                  {count}{' '}
                  {match(tag)
                    .with('peps', () => t(`scenarios:sanction.lists.peps`))
                    .with('third-parties', () => t(`scenarios:sanction.lists.third_parties`))
                    .with('sanctions', () => t(`scenarios:sanction.lists.sanctions`))
                    .with('adverse-media', () => t(`scenarios:sanction.lists.adverse_media`))
                    .otherwise(() => t(`scenarios:sanction.lists.other`))}
                </RecapCapsule>
              ))}
            </div>
          );
        })
        .exhaustive()}
    </RecapRow>
  );
};
