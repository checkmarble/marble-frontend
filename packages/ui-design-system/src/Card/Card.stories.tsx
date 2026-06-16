import { type Meta, type StoryFn } from '@storybook/react';

import { Button } from '../Button/Button';
import Typo from '../Typography/Typo';
import { Card, type CardProps } from './Card';

const cardColors = ['default', 'purple'] as const;

type StoryProps = CardProps;

const Story: Meta<StoryProps> = {
  component: Card,
  title: 'Card',
  args: {
    children: 'Card content',
    color: 'default',
  },
  argTypes: {
    children: { control: 'text' },
    className: { control: 'text' },
    color: {
      control: { type: 'select' },
      options: cardColors.slice(),
    },
  },
};
export default Story;

const Template: StoryFn<StoryProps> = (args) => <Card {...args} />;
const noop = () => {
  // Noop
};

export const Primary = Template.bind({});
Primary.args = {};

export const Variants: StoryFn<StoryProps> = () => (
  <div className="flex flex-col gap-4 md:flex-row">
    <Card color="default">Default card</Card>
    <Card color="purple">Purple card</Card>
  </div>
);

export const WithRichContent: StoryFn<StoryProps> = () => (
  <Card className="flex max-w-sm flex-col gap-3">
    <Typo variant="subtitle1">Card title</Typo>
    <p className="text-s text-grey-secondary">
      Cards group related content and actions. They accept any children and an optional color variant.
    </p>
    <Button className="self-start" onClick={noop}>
      Take action
    </Button>
  </Card>
);
