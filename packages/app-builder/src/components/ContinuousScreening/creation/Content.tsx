import { useCallbackRef } from '@marble/shared';
import { match } from 'ts-pattern';
import { ButtonV2 } from 'ui-design-system';
import { CreationStepperSharp } from '../context/CreationStepper';
import { Step1 } from './steps/Step1';

export const CreationContent = () => {
  const creationStepper = CreationStepperSharp.useSharp();
  const handleNext = useCallbackRef(() => {
    creationStepper.update((state) => (state.step = 'step-2'));
  });

  return (
    <div className="flex flex-col gap-v2-sm h-full">
      <div className="grow">
        {match(creationStepper.value.step)
          .with('step-1', () => <Step1 />)
          .with('step-2', () => <div>Step 2</div>)
          .with('step-3', () => <div>Step 3</div>)
          .exhaustive()}
      </div>
      <div className="shrink-0">
        <ButtonV2 variant="primary" onClick={handleNext}>
          Next
        </ButtonV2>
      </div>
    </div>
  );
};
