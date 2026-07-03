import { type Meta, type StoryFn } from '@storybook/react';
import { useState } from 'react';

import { Button } from '../Button/Button';
import { AIText } from './AIText';

const shortText = 'This rule flags transactions above €10,000 when the account was opened in the last 30 days.';

const markdownText = `This rule detects suspicious activity when **multiple high-value transfers** occur within a short window.

It checks:
- Transaction amount exceeds the configured threshold
- Account age is below 30 days
- Destination country is on the watchlist

The rule triggers a review when all conditions match.`;

const longText = `Line 1: Account opened recently with unusual inbound activity.
Line 2: Multiple transfers to high-risk jurisdictions detected.
Line 3: Velocity spike compared to peer accounts in the same segment.
Line 4: Beneficiary names overlap with previously flagged entities.
Line 5: Transaction patterns suggest potential structuring behavior.
Line 6: Additional manual review is recommended before closing the case.
Line 7: Consider requesting source-of-funds documentation from the client.
Line 8: Escalate to the compliance team if the pattern persists next week.`;

const Story: Meta<typeof AIText> = {
  component: AIText,
  title: 'AIText',
  args: {
    text: markdownText,
    pace: 5,
  },
  argTypes: {
    text: { control: 'text' },
    pace: { control: { type: 'number', min: 1, max: 100, step: 1 } },
    maxLines: { control: { type: 'number', min: 1, max: 12, step: 1 } },
    className: { control: 'text' },
  },
};
export default Story;

const Template: StoryFn<typeof AIText> = (args) => (
  <div className="max-w-xl">
    <AIText {...args} />
  </div>
);

export const Primary = Template.bind({});
Primary.args = {};

export const ShortText = Template.bind({});
ShortText.args = {
  text: shortText,
};

export const WithMaxLines = Template.bind({});
WithMaxLines.args = {
  text: longText,
  maxLines: 3,
};

export const SlowPace = Template.bind({});
SlowPace.args = {
  text: shortText,
  pace: 30,
};

export const TextChange: StoryFn<typeof AIText> = () => {
  const [text, setText] = useState(shortText);

  return (
    <div className="max-w-xl flex flex-col gap-md">
      <div className="flex gap-sm">
        <Button variant="secondary" size="small" onClick={() => setText(shortText)}>
          Short text
        </Button>
        <Button variant="secondary" size="small" onClick={() => setText(markdownText)}>
          Markdown text
        </Button>
        <Button variant="secondary" size="small" onClick={() => setText(longText)}>
          Long text
        </Button>
      </div>
      <AIText text={text} pace={5} maxLines={4} />
    </div>
  );
};
