import { CreationStepperSharp } from '../context/CreationStepper';

const steps = ['step-1', 'step-2', 'step-3'];

export const Stepper = () => {
  const creationStepper = CreationStepperSharp.useSharp();

  return (
    <div className="flex flex-row gap-v2-sm text-default font-normal">
      {steps.map((step) => (
        <span key={step} aria-selected={creationStepper.value.step === step} className="aria-selected:text-purple-65">
          {step}
        </span>
      ))}
    </div>
  );
};
