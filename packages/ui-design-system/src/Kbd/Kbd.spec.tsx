import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Kbd } from './Kbd';

describe('Kbd', () => {
  it('should render with <kbd /> html tag', () => {
    render(<Kbd>A</Kbd>);
    const kbd = screen.getByText('A');
    expect(kbd).toBeInTheDocument();
    expect(kbd.tagName).toBe('KBD');
  });

  it('renders a compact outline for the small variant', () => {
    render(<Kbd variant="small">H</Kbd>);
    const kbd = screen.getByText('H');
    expect(kbd).toHaveClass('h-4');
    expect(kbd).toHaveClass('border-grey-border');
  });
});
