import { type Meta, type StoryFn } from '@storybook/react';
import { type MouseEvent } from 'react';

import { Tag } from '../Tag/Tag';
import { ExpandableGroupTagLine, type ExpandableGroupTagLineProps } from './ExpandableGroupTagLine';

type StoryProps = ExpandableGroupTagLineProps & { width: number };

const labels = ['Fraud', 'Chargeback', 'High risk', 'Manual review', 'PEP', 'Sanctions', 'AML', 'KYC'];

function makeTags(count: number) {
  return labels.slice(0, count).map((label) => (
    <Tag key={label} color="blue" size="small">
      {label}
    </Tag>
  ));
}

const Story: Meta<StoryProps> = {
  component: ExpandableGroupTagLine,
  title: 'ExpandableGroupTagLine',
  args: {
    items: makeTags(8),
    width: 320,
  },
  argTypes: {
    width: {
      control: { type: 'range', min: 80, max: 800, step: 10 },
      description: 'Width of the surrounding container (story only)',
    },
    items: { control: false },
    moreButton: { control: false },
    lessButton: { control: false },
    trailing: { control: false },
  },
  decorators: [
    (StoryComponent, context) => (
      <div style={{ width: context.args.width }} className="border-grey-border rounded border p-2">
        <StoryComponent />
      </div>
    ),
  ],
};
export default Story;

const Template: StoryFn<StoryProps> = ({ width: _width, ...args }) => <ExpandableGroupTagLine {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const NoOverflow = Template.bind({});
NoOverflow.args = {
  items: makeTags(2),
  width: 400,
};

export const Narrow = Template.bind({});
Narrow.args = {
  width: 160,
};

export const WithTrailing = Template.bind({});
WithTrailing.args = {
  trailing: (
    <Tag color="green" size="small">
      +
    </Tag>
  ),
};

export const CustomButtons = Template.bind({});
CustomButtons.args = {
  moreButton: (overflow: number, onExpand: (event: MouseEvent) => void) => (
    <Tag color="orange" size="small" className="cursor-pointer" onClick={onExpand}>
      Show {overflow} more
    </Tag>
  ),
  lessButton: (onCollapse: (event: MouseEvent) => void) => (
    <Tag color="orange" size="small" className="cursor-pointer" onClick={onCollapse}>
      Show less
    </Tag>
  ),
};
