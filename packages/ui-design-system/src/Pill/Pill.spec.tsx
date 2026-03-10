import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Pill } from './Pill';

describe('Pill', () => {
  it('should render successfully', () => {
    render(<Pill>Pill</Pill>);

    expect(screen.getByText('Pill')).toBeInTheDocument();
  });
});
