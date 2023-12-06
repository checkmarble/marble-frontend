import { render, screen } from '@testing-library/react';

import { Tag } from './Tag';

describe('Tag', () => {
  it('should render successfully', () => {
    render(<Tag>Tag</Tag>);

    expect(screen.getByText('Tag')).toBeInTheDocument();
  });
});
