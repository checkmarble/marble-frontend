import { type Meta, type StoryFn } from '@storybook/react';

import { StepProgressBar, type StepProgressBarProps } from './StepProgressBar';

const steps = [
  { key: 'draft', label: 'Draft' },
  { key: 'commit', label: 'Commit' },
  { key: 'prepare', label: 'Prepare' },
  { key: 'activate', label: 'Activate' },
] as const;

type DeploymentStep = (typeof steps)[number]['key'];

const Story: Meta<StepProgressBarProps<DeploymentStep>> = {
  component: StepProgressBar,
  title: 'StepProgressBar',
  args: {
    steps,
    value: 'commit',
    numbered: true,
    isPending: false,
    color: 'purple',
  },
  argTypes: {
    value: {
      control: { type: 'select' },
      options: steps.map((step) => step.key),
      name: 'Value',
    },
    color: {
      control: { type: 'select' },
      options: ['purple', 'blue', 'green', 'yellow', 'orange', 'red', 'grey', 'white'],
      name: 'Color',
    },
    numbered: { control: 'boolean', name: 'Numbered' },
    isPending: { control: 'boolean', name: 'Is pending' },
  },
};
export default Story;

const Template: StoryFn<StepProgressBarProps<DeploymentStep>> = (args) => {
  return (
    <div className="w-[480px]">
      <StepProgressBar {...args} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = { value: 'commit' };

export const Numberless = Template.bind({});
Numberless.args = { value: 'commit', numbered: false };

export const Pending = Template.bind({});
Pending.args = { value: 'commit', isPending: true };

export const Completed = Template.bind({});
Completed.args = { value: 'activate' };

export const OtherColor = Template.bind({});
OtherColor.args = { value: 'prepare', color: 'green' };
