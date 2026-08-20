import { describe, expect, it } from 'vitest';
import {
  getScheduledExecutionsRefetchInterval,
  SCHEDULED_EXECUTIONS_REFETCH_INTERVAL_MS,
} from './list-scheduled-executions';

describe('getScheduledExecutionsRefetchInterval', () => {
  it('returns 1000 when any execution is pending', () => {
    expect(getScheduledExecutionsRefetchInterval([{ status: 'pending' }])).toBe(
      SCHEDULED_EXECUTIONS_REFETCH_INTERVAL_MS,
    );
  });

  it('returns 1000 when any execution is processing', () => {
    expect(getScheduledExecutionsRefetchInterval([{ status: 'success' }, { status: 'processing' }])).toBe(
      SCHEDULED_EXECUTIONS_REFETCH_INTERVAL_MS,
    );
  });

  it('returns false when every execution is terminal', () => {
    expect(
      getScheduledExecutionsRefetchInterval([
        { status: 'success' },
        { status: 'failure' },
        { status: 'partial_failure' },
      ]),
    ).toBe(false);
  });

  it('returns false for an empty list', () => {
    expect(getScheduledExecutionsRefetchInterval([])).toBe(false);
  });
});
