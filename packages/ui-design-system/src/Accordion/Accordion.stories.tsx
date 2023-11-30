import { type Meta, type StoryFn } from '@storybook/react';

import { Accordion } from './Accordion';

const Story: Meta<typeof Accordion.Container> = {
  component: Accordion.Container,
  title: 'Accordion',
};
export default Story;

const items = [
  {
    title: 'item-1',
    description: 'my first item',
  },
  {
    title: 'item-2',
    description: 'my second item',
  },
  {
    title: 'item-3',
    description: 'my third item',
  },
];

export const Default: StoryFn<typeof Accordion> = () => (
  <Accordion.Container>
    {items.map((item) => (
      <Accordion.Item
        key={item.title}
        value={item.title}
        className="overflow-hidden focus-within:relative"
      >
        <Accordion.Title className="flex flex-1 items-center justify-between gap-4">
          {item.title}
          <Accordion.Arrow />
        </Accordion.Title>
        <Accordion.Content>
          <div className="p-2">{item.description}</div>
        </Accordion.Content>
      </Accordion.Item>
    ))}
  </Accordion.Container>
);
