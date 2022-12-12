import { render, screen } from '@testing-library/react';

import { Button } from './Button';

describe('Button', () => {
  it('should render successfully', () => {
    render(<Button name="test">Test</Button>);

    const button = screen.getByRole('button', { name: /test/i });
    expect(button).toBeInTheDocument();
  });
});
