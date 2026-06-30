import { sanitizeTruthyDatasets } from '@app-builder/components/ListAndTopicConfiguration';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  ContinuousScreeningConfig,
  PrevalidationCreateContinuousScreeningConfig,
} from '@app-builder/models/continuous-screening';
import { ScreeningAvailableFiltersAdapted } from '@app-builder/models/screening';
import { useUpdateContinuousScreeningConfigurationMutation } from '@app-builder/queries/continuous-screening/update-configuration';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Callout } from '../Callout';
import { Panel, PanelSharpFactory } from '../Panel';
import { DatasetSelectionSection } from './validation/DatasetSelectionSection';
import { GeneralInfoSection } from './validation/GeneralInfoSection';
import { ObjectMappingSection } from './validation/ObjectMappingSection';
import { ScoringConfigurationSection } from './validation/ScoringConfigurationSection';

export type EditionValidationPanelBaseProps = {
  baseConfig: ContinuousScreeningConfig;
  updatedConfig: PrevalidationCreateContinuousScreeningConfig;
};

export type EditionValidationPanelProps = EditionValidationPanelBaseProps & {
  onCancel: (draft: PrevalidationCreateContinuousScreeningConfig) => void;
  datasets: ScreeningAvailableFiltersAdapted;
};

export const EditionValidationPanel = ({
  baseConfig,
  updatedConfig,
  onCancel,
  datasets,
}: EditionValidationPanelProps) => {
  const panelSharp = PanelSharpFactory.useSharp();
  const { t } = useTranslation(['continuousScreening', 'common']);
  const updateConfigurationMutation = useUpdateContinuousScreeningConfigurationMutation(baseConfig.stableId);
  const revalidate = useLoaderRevalidator();

  const handleValidateClick = () => {
    updateConfigurationMutation
      .mutateAsync({
        ...updatedConfig,
        datasets: sanitizeTruthyDatasets(updatedConfig.datasets),
      })
      .then(() => {
        toast.success(t('common:success.save'));
        panelSharp.actions.close();
        revalidate();
      })
      .catch(() => {
        toast.error(t('common:errors.unknown'));
      });
  };

  return (
    <Panel.Container size="medium">
      <Panel.Content>
        <Panel.Header>{t('continuousScreening:edition.validation.title')}</Panel.Header>
        <div className="p-lg grow flex flex-col gap-md">
          <Callout bordered className="bg-surface-card mx-md">
            {t('continuousScreening:edition.validation.validation_callout')}
          </Callout>
          <GeneralInfoSection updatedConfig={updatedConfig} baseConfig={baseConfig} />
          <DatasetSelectionSection updatedConfig={updatedConfig} baseConfig={baseConfig} datasets={datasets} />
          <ScoringConfigurationSection updatedConfig={updatedConfig} baseConfig={baseConfig} />
          <ObjectMappingSection updatedConfig={updatedConfig} baseConfig={baseConfig} />
        </div>
        <Panel.Footer>
          <Panel.FooterButton variant="secondary" onClick={() => onCancel(updatedConfig)} label={t('common:cancel')} />
          <Panel.FooterButton variant="primary" onClick={handleValidateClick} label={t('common:save')} />
        </Panel.Footer>
      </Panel.Content>
    </Panel.Container>
  );
};
