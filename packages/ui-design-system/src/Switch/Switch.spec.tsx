import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Switch } from './Switch';

describe('Switch', () => {
  it('should render successfully', () => {
    render(<Switch aria-label="switch" />);
    expect(screen.getByLabelText('switch')).toBeInTheDocument();
  });

  it('should check correctly', async () => {
    render(<Switch aria-label="switch" />);

    const switchButton = screen.getByLabelText('switch');
    expect(switchButton).not.toBeChecked();

    await userEvent.click(switchButton);
    expect(screen.getByLabelText('switch')).toBeChecked();
  });
});
