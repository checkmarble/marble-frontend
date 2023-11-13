import { type Meta, type StoryFn } from '@storybook/react';

import { Collapsible } from './Collapsible';

const Story: Meta<typeof Collapsible.Container> = {
  component: Collapsible.Container,
  title: 'Collapsible',
};
export default Story;

export const Default: StoryFn<typeof Collapsible> = () => (
  <Collapsible.Container>
    <Collapsible.Title>Hello</Collapsible.Title>
    <Collapsible.Content>
      <div>World</div>
    </Collapsible.Content>
  </Collapsible.Container>
);
