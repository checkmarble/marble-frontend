import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { TextArea } from './TextArea';

describe('TextArea', () => {
  it('should render successfully', () => {
    render(<TextArea aria-label="textarea" />);

    const textarea = screen.getByLabelText('textarea');
    expect(textarea).toBeInTheDocument();
  });

  it('should be editable', async () => {
    render(<TextArea placeholder="placeholder" />);

    const textarea = screen.getByPlaceholderText('placeholder');
    expect(textarea).toBeInTheDocument();

    await userEvent.type(textarea, 'input text');
    expect(textarea).toHaveValue('input text');
  });
});
