import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Input, NumberInput } from './Input';

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

describe('NumberInput', () => {
  it('forces a sign for non-negative values when requested', () => {
    const onChange = vi.fn();
    const { rerender } = render(<NumberInput aria-label="number input" value={12} onChange={onChange} forceSign />);

    expect(screen.getByLabelText('number input')).toHaveValue('+12');

    rerender(<NumberInput aria-label="number input" value={-12} onChange={onChange} forceSign />);
    expect(screen.getByLabelText('number input')).toHaveValue('-12');

    rerender(<NumberInput aria-label="number input" value={0} onChange={onChange} forceSign />);
    expect(screen.getByLabelText('number input')).toHaveValue('+0');
  });

  it('uses the first matching threshold color and falls back to the default color', () => {
    const onChange = vi.fn();
    const colorByValue = {
      thresholds: [
        { comparison: '>' as const, threshold: 0, color: 'green' as const },
        { comparison: '<' as const, threshold: 0, color: 'red' as const },
      ],
      defaultColor: 'primary' as const,
    };
    const { rerender } = render(
      <NumberInput aria-label="number input" value={12} onChange={onChange} colorByValue={colorByValue} />,
    );

    expect(screen.getByLabelText('number input')).toHaveClass('text-green-primary');

    rerender(<NumberInput aria-label="number input" value={-12} onChange={onChange} colorByValue={colorByValue} />);
    expect(screen.getByLabelText('number input')).toHaveClass('text-red-primary');

    rerender(<NumberInput aria-label="number input" value={0} onChange={onChange} colorByValue={colorByValue} />);
    expect(screen.getByLabelText('number input')).toHaveClass('text-grey-primary');
  });
});
