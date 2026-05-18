import { type Meta, type StoryFn } from '@storybook/react';
import { useState } from 'react';

import { Stepper, type StepperProps } from './Stepper';

const steps = [
  { key: 'details', label: 'Details' },
  { key: 'review', label: 'Review' },
  { key: 'confirm', label: 'Confirm' },
];

const Story: Meta<StepperProps> = {
  component: Stepper,
  title: 'Stepper',
  args: { steps, currentStep: 1 },
  argTypes: {
    currentStep: {
      control: { type: 'number', min: 0, max: steps.length - 1 },
    },
  },
};
export default Story;

const Template: StoryFn<StepperProps> = (args) => <Stepper {...args} />;

export const Primary = Template.bind({});
Primary.args = {};

export const Clickable: StoryFn<StepperProps> = () => {
  const [currentStep, setCurrentStep] = useState(0);
  return <Stepper steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />;
};
