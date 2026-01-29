import { Fragment } from 'react';
import { cn } from 'ui-design-system';

export type Step = {
  key: string;
  label: string;
};

type StepperProps = {
  steps: Step[];
  currentStep: number;
};

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex flex-row items-center gap-2 text-s font-normal">
      {steps.map((step, index) => {
        const isCurrentStep = currentStep === index;

        return (
          <Fragment key={step.key}>
            <div
              className={cn('flex size-5 items-center justify-center rounded-full text-xs', {
                'bg-purple-primary text-white': isCurrentStep,
                'bg-grey-background-light text-grey-secondary': !isCurrentStep,
              })}
            >
              {index + 1}
            </div>
            <span
              className={cn({
                'text-purple-primary': isCurrentStep,
                'text-grey-secondary': !isCurrentStep,
              })}
            >
              {step.label}
            </span>
            {index < steps.length - 1 ? <div className="h-px w-6 border-b border-dashed border-grey-border" /> : null}
          </Fragment>
        );
      })}
    </div>
  );
}
