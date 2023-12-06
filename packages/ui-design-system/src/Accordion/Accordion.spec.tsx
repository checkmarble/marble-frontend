import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { Accordion } from './Accordion';

describe('Accordion', () => {
  it('should render successfully', async () => {
    render(
      <Accordion.Container>
        <Accordion.Item value="item-1">
          <Accordion.Title>Hello</Accordion.Title>
          <Accordion.Content>World</Accordion.Content>
        </Accordion.Item>
      </Accordion.Container>,
    );
    // it should be close by default
    expect(screen.queryByText('World')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Hello'));
    expect(screen.queryByText('World')).toBeInTheDocument();
  });
});
