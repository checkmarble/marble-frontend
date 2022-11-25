import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { UiDesignSystem } from './UiDesignSystem';

const Story: ComponentMeta<typeof UiDesignSystem> = {
  component: UiDesignSystem,
  title: 'UiDesignSystem',
};
export default Story;

const Template: ComponentStory<typeof UiDesignSystem> = (args) => (
  <UiDesignSystem {...args} />
);

export const Primary = Template.bind({});
Primary.args = {};
