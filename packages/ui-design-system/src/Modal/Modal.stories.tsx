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
      <div className="bg-grey-00 flex flex-col gap-6 p-6">
        <Modal.Description>This is the the modal description</Modal.Description>
        <div className="flex flex-1 flex-row gap-2">
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
