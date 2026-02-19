import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  ContinuousScreeningConfig,
  PrevalidationCreateContinuousScreeningConfig,
} from '@app-builder/models/continuous-screening';
import { useUpdateContinuousScreeningConfigurationMutation } from '@app-builder/queries/continuous-screening/update-configuration';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { Callout } from '../Callout';
import { PanelContainer, PanelSharpFactory } from '../Panel/Panel';
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
};

export const EditionValidationPanel = ({ baseConfig, updatedConfig, onCancel }: EditionValidationPanelProps) => {
  const panelSharp = PanelSharpFactory.useSharp();
  const { t } = useTranslation(['continuousScreening']);
  const updateConfigurationMutation = useUpdateContinuousScreeningConfigurationMutation(baseConfig.stableId);
  const revalidate = useLoaderRevalidator();

  const handleValidateClick = () => {
    updateConfigurationMutation.mutateAsync(updatedConfig).then((res) => {
      if (res.success) {
        panelSharp.actions.close();
      }
      revalidate();
    });
  };

  return (
    <PanelContainer size="max" className="p-0 bg-surface-page overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between gap-v2-md bg-surface-card h-16 px-v2-md border-b border-grey-border shrink-0 sticky top-0">
        <Button variant="secondary" mode="icon" onClick={panelSharp.actions.close}>
          <Icon icon="arrow-left" className="size-4" />
        </Button>
        <span className="text-h1 mr-auto font-bold">{t('continuousScreening:edition.validation.title')}</span>
      </div>
      <div className="p-v2-lg grow flex flex-col gap-v2-md">
        <Callout bordered className="bg-surface-card mx-v2-md">
          {t('continuousScreening:edition.validation.validation_callout')}
        </Callout>
        <GeneralInfoSection updatedConfig={updatedConfig} baseConfig={baseConfig} />
        <DatasetSelectionSection updatedConfig={updatedConfig} baseConfig={baseConfig} />
        <ScoringConfigurationSection updatedConfig={updatedConfig} baseConfig={baseConfig} />
        <ObjectMappingSection updatedConfig={updatedConfig} baseConfig={baseConfig} />
      </div>
      <div className="shrink-0 sticky bottom-0 p-v2-lg pt-v2-sm flex justify-end bg-purple-99 gap-v2-md bg-surface-page border-t border-grey-border">
        <Button variant="secondary" onClick={() => onCancel(updatedConfig)}>
          {t('common:cancel')}
        </Button>
        <Button variant="primary" onClick={handleValidateClick}>
          {t('common:save')}
        </Button>
      </div>
    </PanelContainer>
  );
};
