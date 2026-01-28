import {
  ContinuousScreeningConfig,
  PrevalidationCreateContinuousScreeningConfig,
} from '@app-builder/models/continuous-screening';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { PanelContainer, usePanel } from '../Panel';
import {
  ContinuousScreeningConfigurationStepper,
  PartialCreateContinuousScreeningConfig,
} from './context/CreationStepper';
import { FormPagination } from './context/FormPagination';
import { Stepper } from './form/Stepper';
import { DatasetSelection } from './form/steps/DatasetSelection';
import { GeneralInfo } from './form/steps/GeneralInfo';
import { ObjectMapping } from './form/steps/ObjectMapping';
import { ScoringConfiguration } from './form/steps/ScoringConfiguration';

type ConfigurationPanelProps = {
  baseConfig: ContinuousScreeningConfig;
  newConfig: PartialCreateContinuousScreeningConfig;
  onUpdate: (config: PrevalidationCreateContinuousScreeningConfig) => void;
  initialMode?: 'view' | 'edit';
  baseStep?: number;
};

export const ConfigurationPanel = ({
  baseConfig,
  newConfig,
  onUpdate,
  initialMode,
  baseStep,
}: ConfigurationPanelProps) => {
  const { t } = useTranslation(['continuousScreening']);
  const configurationStepper = ContinuousScreeningConfigurationStepper.createSharp(
    initialMode ?? 'view',
    newConfig,
    (data) => {
      onUpdate(data);
    },
  );

  useEffect(() => {
    if (baseStep !== undefined) {
      configurationStepper.actions.setCurrentStep(baseStep);
    }
  }, [baseStep]);

  return (
    <PanelContainer size="max" className="p-0 bg-surface-page overflow-y-auto flex flex-col">
      <ContinuousScreeningConfigurationStepper.Provider value={configurationStepper}>
        <ConfigurationPanelHeader />
        <div className="p-v2-lg grow">
          {match(configurationStepper.value.__internals.currentStep)
            .with(0, () => <GeneralInfo stableId={baseConfig.stableId} />)
            .with(1, () => <ObjectMapping baseConfig={baseConfig} />)
            .with(2, () => <ScoringConfiguration />)
            .with(3, () => <DatasetSelection />)
            .otherwise(() => null)}
        </div>
        <FormPagination finalButtonText={t('continuousScreening:edition.validate_button')} />
      </ContinuousScreeningConfigurationStepper.Provider>
    </PanelContainer>
  );
};

const ConfigurationPanelHeader = () => {
  const { closePanel } = usePanel();
  const { t } = useTranslation(['continuousScreening']);
  const configurationStepper = ContinuousScreeningConfigurationStepper.useSharp();
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);

  return (
    <div className="flex items-center justify-between gap-v2-md bg-surface-card h-16 px-v2-md border-b border-grey-border shrink-0 sticky top-0">
      <ButtonV2 variant="secondary" mode="icon" onClick={closePanel}>
        <Icon icon="arrow-left" className="size-4" />
      </ButtonV2>
      <span className="text-h1 mr-auto font-bold">
        {mode === 'view' ? t('continuousScreening:panel.title.view') : t('continuousScreening:panel.title.edit')}
      </span>
      <Stepper fromZero getStepLabel={(stepName) => t(`continuousScreening:panel.stepper.${stepName}`)} />
      {mode === 'view' ? (
        <ButtonV2 variant="primary" onClick={() => configurationStepper.actions.setMode('edit', 0)}>
          {t('common:edit')}
        </ButtonV2>
      ) : null}
    </div>
  );
};
