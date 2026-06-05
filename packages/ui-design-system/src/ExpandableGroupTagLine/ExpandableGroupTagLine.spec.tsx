import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { describe, expect, it } from 'vitest';

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

describe('ExpandableGroupTagLine', () => {
  // In jsdom every element reports an offsetWidth of 0, so the overflow
  // calculation keeps a single visible item and collapses the rest behind the
  // "more" button. This lets us exercise the expand/collapse behaviour.

  it('should render successfully', () => {
    render(<ExpandableGroupTagLine items={makeItems()} />);

    // Every item is also mirrored in the (aria-hidden) ghost row used for
    // measuring, so each label is present at least once.
    for (const label of labels) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it('should show the default overflow "more" button when items do not fit', () => {
    render(<ExpandableGroupTagLine items={makeItems()} />);

    // 4 items, 1 visible => overflow of 3.
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('should not render the "more" button when a single item fits', () => {
    render(<ExpandableGroupTagLine items={makeItems(1)} />);

    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it('should expand to reveal all items and hide the "more" button on click', async () => {
    const user = userEvent.setup();
    render(<ExpandableGroupTagLine items={makeItems()} />);

    await user.click(screen.getByText('+3'));

    expect(screen.queryByText('+3')).not.toBeInTheDocument();
  });

  it('should collapse back when the "less" button is clicked', async () => {
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
