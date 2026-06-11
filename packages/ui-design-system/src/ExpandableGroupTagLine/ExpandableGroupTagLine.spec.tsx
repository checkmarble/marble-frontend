import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Tag } from '../Tag/Tag';
import { ExpandableGroupTagLine } from './ExpandableGroupTagLine';

mockResizeObserver();

const labels = ['Fraud', 'Chargeback', 'High risk', 'Manual review'];

function makeItems(count = labels.length) {
  return labels.slice(0, count).map((label) => (
    <Tag key={label} size="small">
      {label}
    </Tag>
  ));
}

function mockLayoutWidths({ containerWidth, childWidth }: { containerWidth: number; childWidth: number }) {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains('relative') && this.classList.contains('min-w-0')) {
      return containerWidth;
    }
    return childWidth;
  });
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return childWidth;
  });
}

describe('ExpandableGroupTagLine', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render successfully', () => {
    render(<ExpandableGroupTagLine items={makeItems()} />);

    for (const label of labels) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it('should show all items when container width is not yet measurable', () => {
    render(<ExpandableGroupTagLine items={makeItems()} />);

    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
    for (const label of labels) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it('should show the default overflow "more" button when items do not fit', () => {
    mockLayoutWidths({ containerWidth: 100, childWidth: 50 });
    render(<ExpandableGroupTagLine items={makeItems()} />);

    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('should not render the "more" button when a single item fits', () => {
    mockLayoutWidths({ containerWidth: 400, childWidth: 50 });
    render(<ExpandableGroupTagLine items={makeItems(1)} />);

    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it('should expand to reveal all items and hide the "more" button on click', async () => {
    mockLayoutWidths({ containerWidth: 100, childWidth: 50 });
    const user = userEvent.setup();
    render(<ExpandableGroupTagLine items={makeItems()} />);

    await user.click(screen.getByText('+3'));

    expect(screen.queryByText('+3')).not.toBeInTheDocument();
  });

  it('should collapse back when the "less" button is clicked', async () => {
    mockLayoutWidths({ containerWidth: 100, childWidth: 50 });
    const user = userEvent.setup();
    render(
      <ExpandableGroupTagLine
        items={makeItems()}
        lessButton={(onCollapse) => (
          <button type="button" onClick={onCollapse}>
            Show less
          </button>
        )}
      />,
    );

    await user.click(screen.getByText('+3'));
    expect(screen.queryByText('+3')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show less' }));
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('should use a custom "more" button when provided', () => {
    mockLayoutWidths({ containerWidth: 100, childWidth: 50 });
    render(
      <ExpandableGroupTagLine
        items={makeItems()}
        moreButton={(overflow, onExpand) => (
          <button type="button" onClick={onExpand}>
            Show {overflow} more
          </button>
        )}
      />,
    );

    expect(screen.getByRole('button', { name: 'Show 3 more' })).toBeInTheDocument();
    expect(screen.queryByText('+3')).not.toBeInTheDocument();
  });

  it('should render the trailing node', () => {
    render(<ExpandableGroupTagLine items={makeItems()} trailing={<span>trailing-node</span>} />);

    expect(screen.getByText('trailing-node')).toBeInTheDocument();
  });
});
