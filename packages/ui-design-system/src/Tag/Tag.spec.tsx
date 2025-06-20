import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Tag } from './Tag';

describe('Tag', () => {
  it('should render successfully', () => {
    render(<Tag>Tag</Tag>);

    expect(screen.getByText('Tag')).toBeInTheDocument();
  });
});
