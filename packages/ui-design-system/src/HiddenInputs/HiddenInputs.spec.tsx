import { render, screen } from '@testing-library/react';

import { HiddenInputs } from './HiddenInputs';

describe('HiddenInputs', () => {
  it('should render hidden input successfully', () => {
    render(<HiddenInputs hiddenInput="hiddenInput" />);
    const input = screen.getByDisplayValue('hiddenInput');
    expect(input).toBeInTheDocument();
    expect(input).not.toBeVisible();
  });
});
