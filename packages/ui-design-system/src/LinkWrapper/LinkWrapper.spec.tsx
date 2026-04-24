import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { type MouseEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { LinkWrapper } from './LinkWrapper';

describe('LinkWrapper', () => {
  it('should forward row clicks to the wrapped link', async () => {
    const user = userEvent.setup();
    const onLinkClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault());

    render(
      <LinkWrapper
        aria-label="Open item"
        link={
          <a href="/items/1" onClick={onLinkClick}>
            Open item
          </a>
        }
      >
        <span>Row content</span>
      </LinkWrapper>,
    );

    await user.click(screen.getByRole('link', { name: 'Open item' }));

    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });

  it('should preserve modifier keys when forwarding mouse clicks', async () => {
    const onLinkClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      expect(event.ctrlKey).toBe(true);
    });

    render(
      <LinkWrapper
        aria-label="Open item"
        link={
          <a href="/items/1" onClick={onLinkClick}>
            Open item
          </a>
        }
      >
        <span>Row content</span>
      </LinkWrapper>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Open item' }), { ctrlKey: true });

    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });

  it('should ignore nested interactive elements', async () => {
    const user = userEvent.setup();
    const onLinkClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault());
    const onNestedClick = vi.fn();

    render(
      <LinkWrapper
        aria-label="Open item"
        link={
          <a href="/items/1" onClick={onLinkClick}>
            Open item
          </a>
        }
      >
        <button onClick={onNestedClick} type="button">
          Nested action
        </button>
      </LinkWrapper>,
    );

    await user.click(screen.getByRole('button', { name: 'Nested action' }));

    expect(onNestedClick).toHaveBeenCalledTimes(1);
    expect(onLinkClick).not.toHaveBeenCalled();
  });

  it('should support keyboard activation', async () => {
    const user = userEvent.setup();
    const onLinkClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault());

    render(
      <LinkWrapper
        aria-label="Open item"
        link={
          <a href="/items/1" onClick={onLinkClick}>
            Open item
          </a>
        }
      >
        <span>Row content</span>
      </LinkWrapper>,
    );

    await user.tab();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('link', { name: 'Open item' })).toHaveFocus();
    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });
});
