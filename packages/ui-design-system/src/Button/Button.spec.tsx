import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('should render successfully', () => {
    render(<Button name="test">Test</Button>);

    const button = screen.getByRole('button', { name: /test/i });
    expect(button).toBeInTheDocument();
  });

  it('should handle click', async () => {
    const onClick = vi.fn();
    render(
      <Button name="test" onClick={onClick}>
        Test
      </Button>,
    );

    const button = screen.getByRole('button', { name: /test/i });
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it('passes its ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();

    render(<Button ref={ref}>Test</Button>);

    expect(ref.current).toBe(screen.getByRole('button', { name: 'Test' }));
  });
});
