import { render, screen } from '@testing-library/react';

import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('should render fallback successfully', () => {
    render(<Avatar firstName="Christop" lastName="Ruecker" />);

    expect(screen.getByText('CR')).toBeInTheDocument();
  });

  it('should render fallback if img src is wrong', async () => {
    render(<Avatar firstName="Christop" lastName="Ruecker" src="foo" />);

    expect(await screen.findByText('CR')).toBeInTheDocument();
  });
});
