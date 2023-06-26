import type { Meta, StoryFn } from '@storybook/react';
import clsx from 'clsx';
import { useState } from 'react';

import { ComboBox } from './ComboBox';

const Story: Meta<typeof ComboBox> = {
  component: ComboBox,
  title: 'ComboBox',
};
export default Story;

const books = [
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
];
type Book = (typeof books)[0];
function getBooksFilter(inputValue: string) {
  const lowerCasedInputValue = inputValue.toLowerCase();

  return function booksFilter(book: Book) {
    return (
      !inputValue ||
      book.title.toLowerCase().includes(lowerCasedInputValue) ||
      book.author.toLowerCase().includes(lowerCasedInputValue)
    );
  };
}

export const Default: StoryFn<typeof ComboBox<Book>> = ({
  items,
  renderItemInList,
  itemToKey,
  itemToString,
  ...args
}) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <ComboBox
      items={items.filter(getBooksFilter(inputValue))}
      onInputValueChange={({ inputValue }) => setInputValue(inputValue ?? '')}
      renderItemInList={({ item, isHighlighted, isSelected }) => (
        <div
          className={clsx(
            'bg-g flex flex-col px-3 py-2 shadow-sm',
            isHighlighted && 'bg-purple-05 text-purple-100',
            isSelected && 'text-purple-100'
          )}
        >
          <span>{item.title}</span>
          <span className="text-sm text-gray-700">{item.author}</span>
        </div>
      )}
      itemToKey={(item) => `${item.title}${item.author}`}
      itemToString={(item) => item?.title ?? ''}
      placeholder="Select a value..."
      {...args}
    />
  );
};
Default.args = {
  items: books,
};
