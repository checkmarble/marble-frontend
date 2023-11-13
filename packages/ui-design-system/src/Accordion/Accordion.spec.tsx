import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Accordion } from './Accordion';

describe('Accordion', () => {
  it('should render successfully', async () => {
    const { baseElement, getByText } = render(
      <Accordion.Container>
        <Accordion.Title>Hello</Accordion.Title>
        <Accordion.Content>World</Accordion.Content>
      </Accordion.Container>
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
