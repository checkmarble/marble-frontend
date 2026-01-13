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
    <div className="flex flex-col gap-v2-sm h-full relative">
      <div className="grow p-v2-lg pb-0 flex flex-col gap-v2-md">
        {match(creationStepper.computed.currentStep.value)
          .with(1, () => <ObjectMapping />)
          .with(2, () => <ScoringConfiguration />)
          .with(3, () => <DatasetSelection />)
          .otherwise(() => null)}
        <CreationContentRecap />
      </div>
      <FormPagination finalButtonText={t('continuousScreening:creation.save_configuration')} />
    </div>
  );
};

const CreationContentRecap = () => {
  const creationStepper = ContinuousScreeningConfigurationStepper.useSharp();
  const currentStep = creationStepper.computed.currentStep.value;
  const isValid = creationStepper.computed.isValid.value;

  return (
    <div
      className={cn('bg-surface-card rounded-v2-lg border border-grey-border p-v2-md flex flex-col gap-v2-sm', {
        'bg-green-background-light border-green-border dark:bg-transparent dark:border-green-primary text-green-primary group/recap-valid':
          isValid,
      })}
    >
      {currentStep >= 1 ? <ObjectMappingRecap /> : null}
      {currentStep >= 2 ? <ScoringConfigurationRecap /> : null}
      {currentStep >= 3 ? <DatasetSelectionRecap /> : null}
    </div>
  );
};
