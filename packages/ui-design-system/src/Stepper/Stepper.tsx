import { cva, type VariantProps } from 'class-variance-authority';
import { Fragment, forwardRef } from 'react';

import { cn } from '../utils';

const stepperRoot = cva(['flex flex-row items-center gap-2 text-s font-normal']);

const stepNumber = cva(['flex size-5 items-center justify-center rounded-full text-xs transition-colors'], {
  variants: {
    active: {
      true: 'bg-purple-primary text-white',
      false: 'bg-purple-background text-grey-secondary',
    },
  },
  defaultVariants: {
    active: false,
  },
});

const stepLabel = cva(['transition-colors'], {
  variants: {
    active: {
      true: 'text-purple-primary',
      false: 'text-grey-secondary',
    },
    clickable: {
      true: 'cursor-pointer',
      false: '',
    },
  },
  defaultVariants: {
    active: false,
    clickable: false,
  },
});

export type StepperStep = {
  key: string;
  label: string;
};

export type StepperProps = VariantProps<typeof stepperRoot> & {
  steps: StepperStep[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
};

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(function Stepper(
  { steps, currentStep, onStepClick, className, ...props },
  ref,
) {
  const isClickable = !!onStepClick;

  return (
    <div ref={ref} className={cn(stepperRoot(), className)} {...props}>
      {steps.map((step, index) => {
        const isActive = currentStep === index;

        return (
          <Fragment key={step.key}>
            <div className={stepNumber({ active: isActive })}>{index + 1}</div>
            <span
              className={stepLabel({ active: isActive, clickable: isClickable })}
              onClick={onStepClick ? () => onStepClick(index) : undefined}
              aria-current={isActive ? 'step' : undefined}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && <div className="h-px w-6 border-b border-dashed border-grey-border" />}
          </Fragment>
        );
      })}
    </div>
  );
});
