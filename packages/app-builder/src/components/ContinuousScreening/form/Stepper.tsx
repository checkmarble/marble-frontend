import { useCallbackRef } from '@marble/shared';
import { Fragment } from 'react';
import { cn } from 'ui-design-system';
import { ContinuousScreeningConfigurationStepper } from '../context/CreationStepper';

export const Stepper = ({
  fromZero = false,
  getStepLabel,
}: {
  fromZero?: boolean;
  getStepLabel: (stepName: string) => string;
}) => {
  const creationStepper = ContinuousScreeningConfigurationStepper.useSharp();
  const steps = creationStepper.select((state) => state.__internals.steps);
  const initialStep = creationStepper.select((state) => state.__internals.initialStep);
  const currentStep = creationStepper.computed.currentStep.value;
  const handleStepChange = useCallbackRef((stepIndex: number) => {
    creationStepper.actions.setCurrentStep(stepIndex);
  });

  return (
    <StepperComponent
      fromZero={fromZero}
      steps={steps.map((step) => ({ name: step.name }))}
      startAt={initialStep}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      getStepLabel={getStepLabel}
    />
  );
};

type StepperComponentProps = {
  fromZero?: boolean;
  steps: { name: string }[];
  startAt: number;
  currentStep: number;
  onStepChange: (step: number) => void;
  getStepLabel: (stepName: string) => string;
};

export const StepperComponent = ({
  steps,
  startAt,
  currentStep,
  onStepChange,
  getStepLabel,
  fromZero = false,
}: StepperComponentProps) => {
  return (
    <div className="flex flex-row gap-v2-sm text-default font-normal items-center">
      {steps.map((step, index) => {
        if (index < startAt) return null;

        const isCurrentStep = currentStep === index;

        return (
          <Fragment key={step.name}>
            <div
              className={cn('size-5 flex items-center justify-center rounded-full bg-grey-background text-small', {
                'bg-purple-background text-purple-primary': isCurrentStep,
              })}
            >
              {index + (fromZero ? 0 : 1)}
            </div>
            <span
              aria-selected={isCurrentStep}
              className="aria-selected:text-purple-primary"
              onClick={() => onStepChange(index)}
            >
              {getStepLabel(step.name)}
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
