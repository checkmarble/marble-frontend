import { type Meta, type StoryFn } from '@storybook/react';

import { SelectV2, type SelectV2Props } from './Select';

type StoryProps = Pick<SelectV2Props<string>, 'disabled' | 'placeholder'>;

const Story: Meta<typeof SelectV2> = {
  component: SelectV2,
  title: 'SelectV2',
  parameters: {
    // Render the static story source instead of dynamically serializing the rendered
    // element tree. The dynamic serializer (react-element-to-jsx-string) infinite-loops
    // when an `options` entry's `label` is a React element (see the Complex story).
    docs: { source: { type: 'code' } },
  },
  args: {
    placeholder: 'Select a value...',
    disabled: false,
  },
  argTypes: {
    placeholder: { type: 'string' },
    disabled: { type: 'boolean' },
  },
};

export default Story;

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple', 'pear'];

export const Default: StoryFn<StoryProps> = (args) => (
  <SelectV2
    {...args}
    value="apple"
    onChange={() => undefined}
    options={fruits.map((fruit) => ({
      label: fruit,
      value: fruit,
    }))}
  />
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

export const Complex: StoryFn<StoryProps> = ({ placeholder, ...args }: StoryProps) => (
  <SelectV2
    {...args}
    value={bookKeys[0] ?? ''}
    onChange={() => undefined}
    placeholder={placeholder}
    displayedValue={(option) => books.get(option.value)?.title ?? option.value}
    options={bookKeys.map((bookKey) => {
      const book = books.get(bookKey);

      return {
        label: book ? (
          <div>
            <p className="text-s text-grey-primary text-start font-semibold">{book.title}</p>
            <p className="text-grey-secondary text-start text-xs font-normal">{book.author}</p>
          </div>
        ) : (
          bookKey
        ),
        value: bookKey,
      };
    })}
  />
);
