import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Collapsible, CollapsibleV2 } from './Collapsible';

describe('Collapsible', () => {
  it('should render successfully', async () => {
    render(
      <Collapsible.Container aria-label="collapsible">
        <Collapsible.Title>Hello</Collapsible.Title>
        <Collapsible.Content>World</Collapsible.Content>
      </Collapsible.Container>,
    );
    // it should be open by default
    const content = screen.getByText('World');
    expect(content).toBeInTheDocument();
    const collapsible = screen.getByLabelText('collapsible');
    expect(collapsible).toHaveAttribute('data-state', 'open');

    const title = screen.getByText('Hello');
    await userEvent.click(title);

    expect(collapsible).toHaveAttribute('data-state', 'closed');
  });
});

describe('CollapsibleV2', () => {
  it('should render successfully', async () => {
    render(
      <CollapsibleV2.Provider>
        <CollapsibleV2.Title>Hello</CollapsibleV2.Title>
        <CollapsibleV2.Content>World</CollapsibleV2.Content>
      </CollapsibleV2.Provider>,
    );
    // it should be closed by default
    const title = screen.getByText('Hello');
    expect(title).toHaveRole('button');
    expect(title).toHaveAttribute('aria-expanded', 'false');

    const content = screen.getByText('World');
    expect(content).not.toBeVisible();

    await userEvent.click(title);

    expect(title).toHaveAttribute('aria-expanded', 'true');
    expect(content).toBeVisible();
  });
});
