import { type Meta, type StoryFn } from '@storybook/react';

import { LinkWrapper, type LinkWrapperProps } from './LinkWrapper';

const Story: Meta<LinkWrapperProps> = {
  component: LinkWrapper,
  title: 'LinkWrapper',
};
export default Story;

const Template: StoryFn<LinkWrapperProps> = (args) => (
  <LinkWrapper
    {...args}
    className="hover:bg-purple-background-light flex max-w-md cursor-pointer flex-col gap-sm rounded-sm border border-grey-border bg-surface-card p-md outline-hidden focus-visible:ring-2 focus-visible:ring-purple-primary"
    link={
      <a href="#row-target" onClick={(e) => e.preventDefault()}>
        Open row
      </a>
    }
  >
    <span className="text-m font-semibold">Acme Corporation</span>
    <span className="text-s text-grey-secondary">
      Click anywhere on the card to follow the hidden link. The button below stays interactive on its own.
    </span>
    <button
      type="button"
      className="self-start rounded-xs border border-grey-border px-xs py-2xs text-s"
      onClick={() => alert('Inner button clicked — link suppressed')}
    >
      Inner action
    </button>
  </LinkWrapper>
);

export const Primary = Template.bind({});
Primary.args = {};
