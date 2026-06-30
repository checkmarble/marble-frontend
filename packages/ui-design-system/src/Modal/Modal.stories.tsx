import { type Meta, type StoryFn } from '@storybook/react';

import { Button } from '../Button/Button';
import { Modal } from './Modal';

const Story: Meta<typeof Modal.Root> = {
  component: Modal.Root,
  title: 'Modal',
};
export default Story;

const Template: StoryFn<typeof Modal> = (args) => (
  <Modal.Root {...args}>
    <Modal.Trigger asChild>
      <Button>Trigger</Button>
    </Modal.Trigger>
    <Modal.Content>
      <Modal.Title>Modal title</Modal.Title>
      <Modal.Description className="p-lg">This is the the modal description</Modal.Description>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label="Cancel" />
        <Modal.FooterButton label="Publish" />
      </Modal.Footer>
    </Modal.Content>
  </Modal.Root>
);

export const Primary = Template.bind({});
Primary.args = {};

const ScrollableTemplate: StoryFn<typeof Modal> = (args) => (
  <Modal.Root {...args}>
    <Modal.Trigger asChild>
      <Button>Open scrollable modal</Button>
    </Modal.Trigger>
    <Modal.Content>
      <Modal.Title>Scrollable modal</Modal.Title>
      <Modal.Description className="text-grey-secondary text-small px-lg pb-mf text-center">
        Scroll the content to see sticky header and footer borders appear and disappear.
      </Modal.Description>
      <div className="flex flex-col gap-md p-lg">
        {Array.from({ length: 30 }, (_, index) => (
          <p key={index}>Content line {index + 1}</p>
        ))}
      </div>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label="Cancel" />
        <Modal.FooterButton label="Save" />
      </Modal.Footer>
    </Modal.Content>
  </Modal.Root>
);

export const Scrollable = ScrollableTemplate.bind({});
Scrollable.args = {};

const LoadingFooterTemplate: StoryFn<typeof Modal> = (args) => (
  <Modal.Root defaultOpen {...args}>
    <Modal.Trigger asChild>
      <Button>Open modal</Button>
    </Modal.Trigger>
    <Modal.Content>
      <Modal.Title>Delete item</Modal.Title>
      <Modal.Description className="text-grey-secondary text-small px-lg pb-md">
        Footer buttons with loading spinners keep enabled colors for contrast.
      </Modal.Description>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label="Cancel" />
        <Modal.FooterButton variant="destructive" label="Delete" isLoading leadingIcon="delete" />
        <Modal.FooterButton label="Save" isLoading />
      </Modal.Footer>
    </Modal.Content>
  </Modal.Root>
);

export const LoadingFooter = LoadingFooterTemplate.bind({});
LoadingFooter.args = {};
