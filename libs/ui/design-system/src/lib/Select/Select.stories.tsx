import type { Story, Meta } from '@storybook/react';
import { Select, SelectProps } from './Select';
import { tagBorder } from './Select.constants';

type StoryProps = Pick<SelectProps, 'disabled' | 'placeholder' | 'border'>;

const Story: Meta<StoryProps> = {
  component: Select.Default,
  title: 'Select',
  argTypes: {
    placeholder: { type: 'string', defaultValue: 'Select a value...' },
    disabled: { type: 'boolean', defaultValue: false },
    border: {
      control: { type: 'radio' },
      options: tagBorder,
      defaultValue: tagBorder[0],
    },
  },
};
export default Story;

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple'];

export const Default: Story<StoryProps> = (args) => (
  <Select.Default {...args}>
    {fruits.map((fruit) => {
      return (
        <Select.DefaultItem key={fruit} value={fruit}>
          {fruit}
        </Select.DefaultItem>
      );
    })}
  </Select.Default>
);

const books = new Map(
  [
    { author: 'Harper Lee', title: 'To Kill a Mockingbird' },
    { author: 'Lev Tolstoy', title: 'War and Peace' },
    { author: 'Fyodor Dostoyevsy', title: 'The Idiot' },
    { author: 'Oscar Wilde', title: 'A Picture of Dorian Gray' },
    { author: 'George Orwell', title: '1984' },
    { author: 'Jane Austen', title: 'Pride and Prejudice' },
    { author: 'Marcus Aurelius', title: 'Meditations' },
    { author: 'Fyodor Dostoevsky', title: 'The Brothers Karamazov' },
    { author: 'Lev Tolstoy', title: 'Anna Karenina' },
    { author: 'Fyodor Dostoevsky', title: 'Crime and Punishment' },
  ].map((book) => [`${book.author}_${book.title}`, book])
);

const bookKeys = Array.from(books.keys());

export const Complex: Story<StoryProps> = ({
  placeholder,
  border,
  ...args
}) => (
  <Select.Root {...args}>
    <Select.Trigger border={border}>
      <Select.Value placeholder={placeholder} />
    </Select.Trigger>
    <Select.Content>
      <Select.Viewport>
        {bookKeys.map((bookKey) => {
          const book = books.get(bookKey);
          if (!book) return undefined;

          return (
            <Select.Item key={bookKey} value={bookKey} className="group">
              <Select.ItemText>
                <p className="text-text-s-semibold-cta text-grey-100 group-radix-highlighted:text-blue-100 group-radix-state-open:text-blue-100 text-left">
                  {book.title}
                </p>
                <p className="text-text-xs-regular text-grey-50 group-radix-highlighted:text-blue-50 group-radix-state-open:text-blue-50 text-left">
                  {book.author}
                </p>
              </Select.ItemText>
            </Select.Item>
          );
        })}
      </Select.Viewport>
    </Select.Content>
  </Select.Root>
);
