import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Collapsible } from './Collapsible';

describe('Collapsible', () => {
  it('should render successfully', async () => {
    const { baseElement, getByText } = render(
      <Collapsible.Container aria-label="collapsible">
        <Collapsible.Title>Hello</Collapsible.Title>
        <Collapsible.Content>World</Collapsible.Content>
      </Collapsible.Container>
    );
    expect(baseElement).toBeTruthy();
    // it should be open by default
    const content = getByText('World');
    expect(content).toBeInTheDocument();
    const collapsible = screen.getByLabelText('collapsible');
    expect(collapsible).toHaveAttribute('data-state', 'open');

    const title = getByText('Hello');
    await userEvent.click(title);

    expect(collapsible).toHaveAttribute('data-state', 'closed');
  });
});
