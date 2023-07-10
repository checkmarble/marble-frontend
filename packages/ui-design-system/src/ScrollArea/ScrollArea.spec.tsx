import { render, screen } from '@testing-library/react';

import { ScrollArea } from './ScrollArea';

describe('ScrollArea', () => {
  it('should render successfully', () => {
    render(
      <ScrollArea.Root>
        <ScrollArea.Viewport className="max-h-10">
          <ul>
            {Array.from({ length: 15 }).map((_, index) => (
              <li key={index}>
                <span>{index}</span>
              </li>
            ))}
          </ul>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
        <ScrollArea.Scrollbar orientation="horizontal">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner />
      </ScrollArea.Root>
    );
    expect(screen.getAllByRole('listitem').length).toBe(15);
  });
});
