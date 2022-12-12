import { render, screen } from '@testing-library/react';

import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('should render successfully', () => {
    render(<Avatar firstName="Christop" lastName="Ruecker" />);

    expect(screen.getByText('CR')).toBeInTheDocument();
  });
});
