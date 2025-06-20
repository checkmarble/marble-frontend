import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('should render successfully', () => {
    render(<Checkbox aria-label="checkbox" />);
    expect(screen.getByLabelText('checkbox')).toBeInTheDocument();
  });

  it('should check correctly', async () => {
    render(<Checkbox aria-label="checkbox" />);

    const checkbox = screen.getByLabelText('checkbox');
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    expect(screen.getByLabelText('checkbox')).toBeChecked();
  });
});
