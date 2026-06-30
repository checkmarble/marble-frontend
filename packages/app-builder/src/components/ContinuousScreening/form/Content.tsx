import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { cn } from 'ui-design-system';
import { ContinuousScreeningConfigurationStepper } from '../context/CreationStepper';
import { FormPagination } from '../context/FormPagination';
import { DatasetSelectionRecap } from './recaps/DatasetSelectionRecap';
import { ObjectMappingRecap } from './recaps/ObjectMappingRecap';
import { ScoringConfigurationRecap } from './recaps/ScoringConfigurationRecap';
import { DatasetSelection } from './steps/DatasetSelection';
import { ObjectMapping } from './steps/ObjectMapping';
import { ScoringConfiguration } from './steps/ScoringConfiguration';

export const CreationContent = () => {
  const { t } = useTranslation(['continuousScreening']);
  const creationStepper = ContinuousScreeningConfigurationStepper.useSharp();

  return (
    <div className="flex flex-col gap-sm h-full relative">
      <div className="grow p-lg pb-0 flex flex-col gap-md">
        {match(creationStepper.computed.currentStep.value)
          .with(1, () => <ObjectMapping />)
          .with(2, () => <DatasetSelection useCase="continuous_monitoring" />)
          .with(3, () => <ScoringConfiguration />)
          .otherwise(() => null)}
        <CreationContentRecap />
        <FormPagination finalButtonText={t('continuousScreening:creation.save_configuration')} />
      </div>
    </div>
  );
};

const CreationContentRecap = () => {
  const creationStepper = ContinuousScreeningConfigurationStepper.useSharp();
  const currentStep = creationStepper.computed.currentStep.value;
  const isValid = creationStepper.computed.isValid.value;

  return (
    <div
      className={cn('bg-surface-card rounded-lg border border-grey-border p-md flex flex-col gap-sm', {
        'bg-green-background-light border-green-border dark:bg-transparent dark:border-green-primary text-green-primary group/recap-valid':
          isValid,
      })}
    >
      {currentStep >= 1 ? <ObjectMappingRecap /> : null}
      {currentStep >= 2 ? <DatasetSelectionRecap /> : null}
      {currentStep >= 3 ? <ScoringConfigurationRecap /> : null}
    </div>
  );
};
