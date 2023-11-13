import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Collapsible } from './Collapsible';

describe('Collapsible', () => {
  it('should render successfully', async () => {
    const { baseElement, getByText } = render(
      <Collapsible.Container>
        <Collapsible.Title>Hello</Collapsible.Title>
        <Collapsible.Content>World</Collapsible.Content>
      </Collapsible.Container>
    );
    expect(baseElement).toBeTruthy();
    // it should be open by default
    const content = getByText('World');
    expect(content).toBeInTheDocument();

    const title = getByText('Hello');
    await userEvent.click(title);

    expect(baseElement).toHaveAttribute('data-state', 'closed');
  });
});
