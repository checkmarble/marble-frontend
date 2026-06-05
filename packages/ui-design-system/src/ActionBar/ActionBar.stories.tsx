import { type Meta, type StoryFn } from '@storybook/react';

import { ActionBar, ActionButton } from './ActionBar';

const Story: Meta<typeof ActionBar> = {
  component: ActionBar,
  title: 'ActionBar',
};
export default Story;

const noop = () => {
  // Noop
};

export const Default: StoryFn<typeof ActionBar> = () => (
  <div className="p-4">
    <ActionBar>
      <ActionButton icon="edit" text="Edit" onClick={noop} />
      <ActionButton icon="copy" text="Duplicate" onClick={noop} />
      <ActionButton icon="delete" text="Delete" onClick={noop} />
    </ActionBar>
  </div>
);

export const WithMore: StoryFn<typeof ActionBar> = () => (
  <div className="p-4">
    <ActionBar more={{ icon: 'more-menu', onClick: noop }}>
      <ActionButton icon="edit" text="Edit" onClick={noop} />
      <ActionButton icon="copy" text="Duplicate" onClick={noop} />
      <ActionButton icon="delete" text="Delete" onClick={noop} />
    </ActionBar>
  </div>
);

export const WithDisabledAction: StoryFn<typeof ActionBar> = () => (
  <div className="p-4">
    <ActionBar>
      <ActionButton icon="edit" text="Edit" onClick={noop} />
      <ActionButton icon="copy" text="Duplicate" onClick={noop} />
      <ActionButton icon="delete" text="Delete" disabled onClick={noop} />
    </ActionBar>
  </div>
);
