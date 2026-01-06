import { Fragment } from 'react/jsx-runtime';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';
import { ContinuousScreeningCreationStepper } from '../context/CreationStepper';

export const Stepper = () => {
  const { t } = useTranslation(['continuousScreening']);
  const creationStepper = ContinuousScreeningCreationStepper.useSharp();
  const steps = creationStepper.select((state) => state.__internals.steps);

  return (
    <div className="flex flex-row gap-v2-sm text-default font-normal items-center">
      {steps.map((step, index) => {
        const isCurrentStep = creationStepper.computed.currentStep.value === index;

        return (
          <Fragment key={step.name}>
            <div
              className={cn('size-5 flex items-center justify-center rounded-full bg-grey-background text-small', {
                'bg-purple-background text-purple-primary': isCurrentStep,
              })}
            >
              {index + 1}
            </div>
            <span
              aria-selected={isCurrentStep}
              className="aria-selected:text-purple-primary"
              onClick={() => creationStepper.actions.setCurrentStep(index)}
            >
              {t(`continuousScreening:creation.stepper.${step.name}`)}
            </span>
            {index < steps.length - 1 ? (
              <div className="h-1 w-10 border-b border-dashed border-grey-border"></div>
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
};
