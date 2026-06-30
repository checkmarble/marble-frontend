import {
  ContinuousScreeningConfig,
  PrevalidationCreateContinuousScreeningConfig,
} from '@app-builder/models/continuous-screening';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button } from 'ui-design-system';
import { Panel } from '../Panel';
import {
  ContinuousScreeningConfigurationStepper,
  PartialCreateContinuousScreeningConfig,
} from './context/CreationStepper';
import { FormPagination } from './context/FormPagination';
import { ListAndTopicDatasetConfigurationBridge } from './context/ListAndTopicDatasetConfigurationBridge';
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
    <Panel.Container size="medium" className="isolate">
      <ContinuousScreeningConfigurationStepper.Provider value={configurationStepper}>
        <ListAndTopicDatasetConfigurationBridge useCase="continuous_monitoring">
          <Panel.Content>
            <ConfigurationPanelHeader />
            <div className="grow">
              {match(configurationStepper.value.__internals.currentStep)
                .with(0, () => <GeneralInfo stableId={baseConfig.stableId} />)
                .with(1, () => <ObjectMapping baseConfig={baseConfig} />)
                .with(2, () => <DatasetSelection useCase="continuous_monitoring" />)
                .with(3, () => <ScoringConfiguration />)
                .otherwise(() => null)}
            </div>
            <FormPagination
              className="bg-surface-card"
              finalButtonText={t('continuousScreening:edition.validate_button')}
            />
          </Panel.Content>
        </ListAndTopicDatasetConfigurationBridge>
      </ContinuousScreeningConfigurationStepper.Provider>
    </Panel.Container>
  );
};

const ConfigurationPanelHeader = () => {
  const { t } = useTranslation(['continuousScreening']);
  const configurationStepper = ContinuousScreeningConfigurationStepper.useSharp();
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);

  return (
    <Panel.Header>
      <div className="flex items-center justify-between gap-md shrink-0 sticky top-0 z-10">
        <span className="me-auto">
          {mode === 'view' ? t('continuousScreening:panel.title.view') : t('continuousScreening:panel.title.edit')}
        </span>
        <Stepper fromZero getStepLabel={(stepName) => t(`continuousScreening:panel.stepper.${stepName}`)} />
        {mode === 'view' ? (
          <Button variant="primary" onClick={() => configurationStepper.actions.setMode('edit', 0)}>
            {t('common:edit')}
          </Button>
        ) : null}
      </div>
    </Panel.Header>
  );
};
