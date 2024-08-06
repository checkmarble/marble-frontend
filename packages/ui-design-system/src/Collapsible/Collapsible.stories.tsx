import { type Meta, type StoryFn } from '@storybook/react';

import { Collapsible, CollapsibleV2 } from './Collapsible';

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

export const DefaultV2: StoryFn<typeof Collapsible> = () => (
  <CollapsibleV2.Provider>
    <CollapsibleV2.Title>Hello</CollapsibleV2.Title>
    <CollapsibleV2.Content>
      <div>World</div>
    </CollapsibleV2.Content>
  </CollapsibleV2.Provider>
);
