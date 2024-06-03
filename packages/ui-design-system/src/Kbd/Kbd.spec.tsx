import { render, screen } from '@testing-library/react';

import { Kbd } from './Kbd';

describe('Kbd', () => {
  it('should render with <kbd /> html tag', () => {
    render(<Kbd>A</Kbd>);
    const kbd = screen.getByText('A');
    expect(kbd).toBeInTheDocument();
    expect(kbd.tagName).toBe('KBD');
  });
});
