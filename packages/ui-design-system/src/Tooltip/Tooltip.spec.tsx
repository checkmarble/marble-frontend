import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { describe, expect, it } from 'vitest';
import { Tooltip } from './Tooltip';

mockResizeObserver();

describe('Tooltip', () => {
  it('should display a tooltip on hover', async () => {
    render(
      <Tooltip.Provider delayDuration={0}>
        <Tooltip.Default content="tooltip">
          <p>label</p>
        </Tooltip.Default>
      </Tooltip.Provider>,
    );

    const label = screen.getByText('label');
    expect(label).toBeInTheDocument();
    expect(screen.queryByText('tooltip')).not.toBeInTheDocument();

    await userEvent.hover(label);
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  });
});
