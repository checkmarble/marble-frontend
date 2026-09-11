import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createRef, useState } from 'react';
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
  it('shows a plus or minus icon for the value sign when requested', () => {
    const onChange = vi.fn();
    const { rerender } = render(<NumberInput aria-label="number input" value={12} onChange={onChange} forceSign />);

    expect(screen.getByLabelText('number input')).toHaveValue('12');
    expect(screen.getByRole('img', { name: '+' })).toBeInTheDocument();

    rerender(<NumberInput aria-label="number input" value={-12} onChange={onChange} forceSign />);
    expect(screen.getByLabelText('number input')).toHaveValue('12');
    expect(screen.getByRole('img', { name: '-' })).toBeInTheDocument();

    rerender(<NumberInput aria-label="number input" value={0} onChange={onChange} forceSign />);
    expect(screen.getByLabelText('number input')).toHaveValue('0');
    expect(screen.queryByRole('img', { name: '+' })).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: '-' })).not.toBeInTheDocument();
  });

  it('updates the sign icon when + or - is typed', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    function ControlledNumberInput() {
      const [value, setValue] = useState(12);
      return (
        <NumberInput
          aria-label="number input"
          value={value}
          onChange={(nextValue) => {
            onChange(nextValue);
            setValue(nextValue);
          }}
          forceSign
        />
      );
    }
    render(<ControlledNumberInput />);
    const input = screen.getByLabelText('number input');

    await user.type(input, '-');

    expect(onChange).toHaveBeenCalledWith(-12);
    expect(input).toHaveValue('12');
    expect(screen.getByRole('img', { name: '-' })).toBeInTheDocument();

    await user.type(input, '+');

    expect(onChange).toHaveBeenCalledWith(12);
    expect(input).toHaveValue('12');
    expect(screen.getByRole('img', { name: '+' })).toBeInTheDocument();
  });

  it('shows an empty sign placeholder for 0 until a non-zero value is entered', async () => {
    const user = userEvent.setup();
    function ControlledNumberInput() {
      const [value, setValue] = useState(0);
      return <NumberInput aria-label="number input" value={value} onChange={setValue} forceSign />;
    }
    render(<ControlledNumberInput />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('number input'), '-');

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByLabelText('number input')).toHaveValue('0');

    await user.type(screen.getByLabelText('number input'), '{backspace}5');

    expect(screen.getByRole('img', { name: '-' })).toBeInTheDocument();
    expect(screen.getByLabelText('number input')).toHaveValue('5');
  });

  it('applies a pasted sign to the icon and value', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<NumberInput aria-label="number input" value={12} onChange={onChange} forceSign />);
    const input = screen.getByLabelText('number input');

    await user.clear(input);
    await user.paste('-8');

    expect(onChange).toHaveBeenCalledWith(-8);
    expect(input).toHaveValue('8');
    expect(screen.getByRole('img', { name: '-' })).toBeInTheDocument();
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
