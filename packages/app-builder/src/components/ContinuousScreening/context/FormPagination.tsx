import { useCallbackRef } from '@marble/shared';
import { useTranslation } from 'react-i18next';
import { Button, cn, StickyComponent } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ContinuousScreeningConfigurationStepper } from '../context/CreationStepper';

export const FormPagination = ({ finalButtonText, className }: { finalButtonText?: string; className?: string }) => {
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
    <StickyComponent inFlow="after" sentinelClassName="top-lg -translate-y-2xs">
      <div
        className={cn(
          'sticky flex justify-end gap-md bottom-0 bg-surface-page -m-lg mt-auto p-lg border-t border-transparent sentinel-intersect:border-grey-border sentinel-intersect:shadow-sticky-bottom',
          className,
        )}
      >
        {creationStepper.computed.hasPrevious.value ? (
          <Button variant="secondary" size="large" onClick={handlePrevious}>
            <Icon icon="arrow-left" className="size-4" />
            {t('common:previous')}
          </Button>
        ) : null}
        {creationStepper.computed.hasNext.value || mode !== 'view' ? (
          <Button
            variant="primary"
            size="large"
            disabled={!creationStepper.computed.canGoNext.value}
            onClick={handleNext}
          >
            {creationStepper.computed.hasNext.value ? t('common:next') : finalButtonText}
            <Icon icon={creationStepper.computed.hasNext.value ? 'arrow-right' : 'tick'} className="size-4" />
          </Button>
        ) : null}
      </div>
    </StickyComponent>
  );
};
