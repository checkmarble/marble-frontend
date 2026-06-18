import { type Meta, type StoryFn } from '@storybook/react';
import { Icon } from 'ui-icons';

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
      <div className="bg-surface-card flex flex-col gap-lg p-lg">
        <Modal.Description>This is the the modal description</Modal.Description>
        <div className="flex flex-1 flex-row gap-sm">
          <Modal.Close asChild>
            <Button variant="secondary" className="flex-1">
              Cancel
            </Button>
          </Modal.Close>
          <Button variant="primary" className="flex-1">
            <Icon icon="pushtolive" className="size-6" />
            Publish
          </Button>
        </div>
      </div>
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
      <Modal.Description className="text-grey-secondary text-small px-6 pb-4 text-center">
        Scroll the content to see sticky header and footer borders appear and disappear.
      </Modal.Description>
      <div className="flex flex-col gap-4 p-6">
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
      <Modal.Description className="text-grey-secondary text-small px-6 pb-4">
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
