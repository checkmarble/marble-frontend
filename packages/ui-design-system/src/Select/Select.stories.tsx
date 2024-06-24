import { type Meta, type StoryFn } from '@storybook/react';

import { Select, type SelectProps } from './Select';
import { selectBorder, selectBorderColor } from './Select.constants';

type StoryProps = Pick<
  SelectProps,
  'disabled' | 'placeholder' | 'border' | 'borderColor'
>;

const Story: Meta<StoryProps> = {
  component: Select.Default,
  title: 'Select',
  args: {
    placeholder: 'Select a value...',
    disabled: false,
    border: selectBorder[0],
    borderColor: selectBorderColor[0],
  },
  argTypes: {
    placeholder: { type: 'string' },
    disabled: { type: 'boolean' },
    border: {
      control: { type: 'radio' },
      options: selectBorder.slice(),
    },
    borderColor: {
      control: { type: 'radio' },
      options: selectBorderColor.slice(),
    },
  },
};
export default Story;

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple', 'pear'];

export const Default: StoryFn<StoryProps> = (args) => (
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
  ].map((book) => [`${book.author}_${book.title}`, book]),
);

const bookKeys = Array.from(books.keys());

export const Complex: StoryFn<StoryProps> = ({
  placeholder,
  border,
  borderColor,
  ...args
}: StoryProps) => (
  <Select.Root {...args} aria-invalid>
    <Select.Trigger border={border} borderColor={borderColor}>
      <Select.Value placeholder={placeholder} />
    </Select.Trigger>
    <Select.Content className="max-h-60 w-full">
      <Select.Viewport>
        {bookKeys.map((bookKey) => {
          const book = books.get(bookKey);
          if (!book) return undefined;

          return (
            <Select.Item key={bookKey} value={bookKey} className="group">
              <Select.ItemText>
                <p className="text-s text-grey-100 group-radix-highlighted:text-blue-100 group-radix-state-open:text-blue-100 text-left font-semibold">
                  {book.title}
                </p>
                <p className="text-grey-50 group-radix-highlighted:text-blue-50 group-radix-state-open:text-blue-50 text-left text-xs font-normal">
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
