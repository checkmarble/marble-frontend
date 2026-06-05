import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StepProgressBar } from './StepProgressBar';

const steps = [
  { key: 'draft', label: 'Draft' },
  { key: 'commit', label: 'Commit' },
  { key: 'prepare', label: 'Prepare' },
  { key: 'activate', label: 'Activate' },
] as const;

describe('StepProgressBar', () => {
  it('renders all step labels', () => {
    render(<StepProgressBar steps={steps} value="commit" />);
    for (const step of steps) {
      expect(screen.getByText(new RegExp(step.label))).toBeInTheDocument();
    }
  });

  it('numbers labels by default', () => {
    render(<StepProgressBar steps={steps} value="commit" />);
    expect(screen.getByText(/1\. Draft/)).toBeInTheDocument();
  });

  it('omits numbering when numbered is false', () => {
    render(<StepProgressBar steps={steps} value="commit" numbered={false} />);
    expect(screen.queryByText(/1\. Draft/)).not.toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('reflects the active step via aria-valuenow', () => {
    render(<StepProgressBar steps={steps} value="commit" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '2');
    expect(progressbar).toHaveAttribute('aria-valuemax', '4');
  });

  it('reports 0 for an unknown value', () => {
    // @ts-expect-error - "unknown" is not one of the step keys
    render(<StepProgressBar steps={steps} value="unknown" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('pulses the fill when isPending is true', () => {
    render(<StepProgressBar steps={steps} value="commit" isPending />);
    const fill = screen.getByRole('progressbar').firstElementChild;
    expect(fill).toHaveClass('animate-pulse');
  });
});
