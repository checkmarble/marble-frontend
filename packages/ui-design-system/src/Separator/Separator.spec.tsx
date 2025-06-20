import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Separator } from './Separator';

describe('Separator', () => {
  it('should render with role="none"', () => {
    render(<Separator decorative />);
    // it should be close by default
    expect(screen.getByRole('none')).toBeInTheDocument();
  });

  it('should render with role="separator"', () => {
    render(<Separator />);
    // it should be close by default
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});
