import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Input } from './Input';

describe('Input', () => {
  it('should render successfully', () => {
    render(<Input aria-label="input" />);

    const input = screen.getByLabelText('input');
    expect(input).toBeInTheDocument();
  });

  it('should be editable', async () => {
    render(<Input aria-label="input" placeholder="placeholder" />);

    const input = screen.getByPlaceholderText('placeholder');
    expect(input).toBeInTheDocument();

    await userEvent.type(input, 'input text');
    expect(input).toHaveValue('input text');
  });

  it('passes its ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();

    render(<Input ref={ref} aria-label="input" />);

    expect(ref.current).toBe(screen.getByLabelText('input'));
  });
});
