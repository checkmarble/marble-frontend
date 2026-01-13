import { useTranslation } from 'react-i18next';
import { ContinuousScreeningConfigurationStepper } from '../../context/CreationStepper';
import { RecapCapsule, RecapRow } from '../../shared/RecapRow';

export const ObjectMappingRecap = () => {
  const { t } = useTranslation(['continuousScreening']);
  const mappingConfigs = ContinuousScreeningConfigurationStepper.select((state) => state.data.mappingConfigs);

  return (
    <RecapRow>
      <span>{t('continuousScreening:creation.objectMapping.recap.title', { count: mappingConfigs.length })}</span>
      {mappingConfigs.map((mappingConfig) => (
        <RecapCapsule key={mappingConfig.objectType}>{mappingConfig.objectType}</RecapCapsule>
      ))}
    </RecapRow>
  );
};
