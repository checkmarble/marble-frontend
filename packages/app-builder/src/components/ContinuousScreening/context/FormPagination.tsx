import { useCallbackRef } from '@marble/shared';
import { useTranslation } from 'react-i18next';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ContinuousScreeningConfigurationStepper } from '../context/CreationStepper';

export const FormPagination = ({ finalButtonText }: { finalButtonText?: string }) => {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const creationStepper = ContinuousScreeningConfigurationStepper.useSharp();
  const currentStep = creationStepper.computed.currentStep.value;
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);

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
    <div className="shrink-0 sticky bottom-0 p-v2-lg pt-v2-sm flex justify-end bg-purple-99 gap-v2-md bg-surface-page border-t border-grey-border">
      {creationStepper.computed.hasPrevious.value ? (
        <ButtonV2 variant="primary" appearance="stroked" onClick={handlePrevious}>
          <Icon icon="arrow-left" className="size-4" />
          {t('common:previous')}
        </ButtonV2>
      ) : null}
      {creationStepper.computed.hasNext.value || mode !== 'view' ? (
        <ButtonV2 variant="primary" disabled={!creationStepper.computed.canGoNext.value} onClick={handleNext}>
          {creationStepper.computed.hasNext.value ? t('common:next') : finalButtonText}
          <Icon icon={creationStepper.computed.hasNext.value ? 'arrow-right' : 'tick'} className="size-4" />
        </ButtonV2>
      ) : null}
    </div>
  );
};
