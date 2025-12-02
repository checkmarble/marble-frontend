import { useCallbackRef } from '@marble/shared';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ContinuousScreeningCreationStepper } from '../context/CreationStepper';
import { DatasetSelectionRecap } from './recaps/DatasetSelectionRecap';
import { ObjectMappingRecap } from './recaps/ObjectMappingRecap';
import { ScoringConfigurationRecap } from './recaps/ScoringConfigurationRecap';
import { DatasetSelection } from './steps/DatasetSelection';
import { ObjectMapping } from './steps/ObjectMapping';
import { ScoringConfiguration } from './steps/ScoringConfiguration';

export const CreationContent = () => {
  const creationStepper = ContinuousScreeningCreationStepper.useSharp();

  return (
    <div className="flex flex-col gap-v2-sm h-full relative">
      <div className="grow p-v2-lg pb-0 flex flex-col gap-v2-md">
        {match(creationStepper.computed.currentStep.value)
          .with(0, () => <ObjectMapping />)
          .with(1, () => <ScoringConfiguration />)
          .with(2, () => <DatasetSelection />)
          .otherwise(() => null)}
        <CreationContentRecap />
      </div>
      <CreationContentFooter />
    </div>
  );
};

const CreationContentRecap = () => {
  const creationStepper = ContinuousScreeningCreationStepper.useSharp();
  const currentStep = creationStepper.computed.currentStep.value;
  const isValid = creationStepper.computed.isValid.value;

  return (
    <div
      className={cn('bg-white rounded-v2-lg border border-grey-border p-v2-md flex flex-col gap-v2-sm', {
        'bg-green-94 border-green-68 text-green-38 group/recap-valid': isValid,
      })}
    >
      {currentStep >= 0 ? <ObjectMappingRecap /> : null}
      {currentStep >= 1 ? <ScoringConfigurationRecap /> : null}
      {currentStep >= 2 ? <DatasetSelectionRecap /> : null}
    </div>
  );
};

const CreationContentFooter = () => {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const creationStepper = ContinuousScreeningCreationStepper.useSharp();
  const currentStep = creationStepper.computed.currentStep.value;

  const handleNext = useCallbackRef(() => {
    if (!creationStepper.computed.canGoNext.value) return;

    if (creationStepper.computed.hasNext.value) {
      creationStepper.actions.setCurrentStep(currentStep + 1);
    } else {
      creationStepper.actions.submit();
    }
  });
  const handlePrevious = useCallbackRef(() => {
    if (creationStepper.computed.hasPrevious.value) {
      creationStepper.actions.setCurrentStep(currentStep - 1);
    }
  });

  return (
    <div className="shrink-0 sticky bottom-0 p-v2-lg pt-v2-sm flex justify-end bg-purple-99 gap-v2-md">
      {creationStepper.computed.hasPrevious.value ? (
        <ButtonV2 variant="primary" appearance="stroked" onClick={handlePrevious}>
          <Icon icon="arrow-left" className="size-4" />
          {t('common:previous')}
        </ButtonV2>
      ) : null}
      <ButtonV2 variant="primary" disabled={!creationStepper.computed.canGoNext.value} onClick={handleNext}>
        {creationStepper.computed.hasNext.value
          ? t('common:next')
          : t('continuousScreening:creation.save_configuration')}
        <Icon icon={creationStepper.computed.hasNext.value ? 'arrow-right' : 'tick'} className="size-4" />
      </ButtonV2>
    </div>
  );
};
