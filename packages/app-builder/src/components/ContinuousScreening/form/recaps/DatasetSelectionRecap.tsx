import { SCREENING_CATEGORY_I18N_KEY_MAP, type ScreeningCategory } from '@app-builder/models/screening';
import { type ListConfigFilters, useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import { useTranslation } from 'react-i18next';
import { ContinuousScreeningConfigurationStepper } from '../../context/CreationStepper';
import { getSectionLeafNames } from '../../shared/dataset-utils';
import { RecapCapsule, RecapRow } from '../../shared/RecapRow';

type SectionData = NonNullable<ListConfigFilters[keyof ListConfigFilters]>;

export const DatasetSelectionRecap = () => {
  const { t } = useTranslation(['continuousScreening', 'scenarios']);
  const listConfigQuery = useListConfigQuery('continuous-screening');
  const datasets = ContinuousScreeningConfigurationStepper.select((state) => state.data.datasets);

  const enabledSections = Object.entries(listConfigQuery.data ?? {}).filter(
    ([key, section]) => !!datasets[key] && section != null,
  ) as [ScreeningCategory, SectionData][];

  return (
    <RecapRow>
      <span>{t('continuousScreening:creation.datasetSelection.recap.title', { count: enabledSections.length })}</span>
      {enabledSections.map(([key, section]) => {
        const leafCount = getSectionLeafNames(key, section).filter((n) => !!datasets[n]).length;
        const sectionLabel = t(`scenarios:sanction.lists.${SCREENING_CATEGORY_I18N_KEY_MAP[key]}`);
        return (
          <RecapCapsule key={key}>
            {sectionLabel}{' '}
            {t('continuousScreening:creation.datasetSelection.recap.section_items', { count: leafCount })}
          </RecapCapsule>
        );
      })}
    </RecapRow>
  );
};
