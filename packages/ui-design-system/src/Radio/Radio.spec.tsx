import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Radio } from './Radio';

describe('Radio', () => {
  it('should render successfully', () => {
    render(
      <Radio.Root value="option1" onValueChange={vi.fn()}>
        <Radio.Item value="option1">Option 1</Radio.Item>
        <Radio.Item value="option2">Option 2</Radio.Item>
      </Radio.Root>,
    );

    expect(screen.getByRole('radio', { name: 'Option 1' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Option 2' })).toBeInTheDocument();
  });

  it('should disable all items when the root is disabled', async () => {
    const onValueChange = vi.fn();
    render(
      <Radio.Root value="option1" onValueChange={onValueChange} disabled>
        <Radio.Item value="option1">Option 1</Radio.Item>
        <Radio.Item value="option2">Option 2</Radio.Item>
      </Radio.Root>,
    );

    const option1 = screen.getByRole('radio', { name: 'Option 1' });
    const option2 = screen.getByRole('radio', { name: 'Option 2' });

    expect(option1).toBeDisabled();
    expect(option2).toBeDisabled();
    expect(option1).toHaveClass('cursor-not-allowed');
    expect(option2).toHaveClass('cursor-not-allowed');

    await userEvent.click(option2);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
