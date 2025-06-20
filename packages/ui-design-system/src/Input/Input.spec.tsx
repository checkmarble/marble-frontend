import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
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
});
