import type { Meta, StoryFn } from '@storybook/react';
import { useRef, useState } from 'react';

import { Combobox } from './Combobox';

const Story: Meta<typeof Combobox.Root> = {
  component: Combobox.Root,
  title: 'Combobox',
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

export const Default: StoryFn<typeof Combobox.Root> = ({ ...args }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedValue, setSelectedValue] = useState<Book | null>(null);
  const [inputValue, setInputValue] = useState('');

  const filteredBooks = books.filter(getBooksFilter(inputValue));

  return (
    <div className="flex flex-col gap-2">
      <Combobox.Root
        {...args}
        value={selectedValue}
        onChange={setSelectedValue}
        nullable
      >
        <div className="relative max-w-xs">
          <Combobox.Input
            ref={inputRef}
            displayValue={(value?: Book) => value?.title ?? ''}
            onChange={(event) => setInputValue(event.target.value)}
          />
          <Combobox.Options className="w-full">
            {filteredBooks.length === 0 && inputValue !== '' ? (
              <div className="text-grey-50 relative cursor-default select-none px-4 py-2">
                Nothing found.
              </div>
            ) : (
              filteredBooks.map((book) => (
                <Combobox.Option
                  key={book.title}
                  className="flex flex-col items-start gap-1"
                  value={book}
                >
                  <span>{book.title}</span>
                  <span className="text-grey-50 text-xs">{book.author}</span>
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox.Root>
      <div className="bg-grey-05 flex flex-col gap-1 rounded p-2">
        Selected book:
        {selectedValue ? (
          <>
            <span>{selectedValue.title}</span>
            <span className="text-grey-50 text-xs">{selectedValue.author}</span>
          </>
        ) : (
          <p>None</p>
        )}
      </div>
    </div>
  );
};
