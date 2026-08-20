import { describe, expect, it } from 'vitest';
import { hasInProgressScheduledExecution, isScheduledExecutionInProgress } from './decision';

describe('isScheduledExecutionInProgress', () => {
  it('treats pending as in progress', () => {
    expect(isScheduledExecutionInProgress('pending')).toBe(true);
  });

  it('treats processing as in progress', () => {
    expect(isScheduledExecutionInProgress('processing')).toBe(true);
  });

  it('treats success as not in progress', () => {
    expect(isScheduledExecutionInProgress('success')).toBe(false);
  });

  it('treats failure as not in progress', () => {
    expect(isScheduledExecutionInProgress('failure')).toBe(false);
  });

  it('treats partial_failure as not in progress', () => {
    expect(isScheduledExecutionInProgress('partial_failure')).toBe(false);
  });
});

describe('hasInProgressScheduledExecution', () => {
  it('is true if any row is in progress', () => {
    expect(hasInProgressScheduledExecution([{ status: 'success' }, { status: 'pending' }])).toBe(true);
    expect(hasInProgressScheduledExecution([{ status: 'processing' }])).toBe(true);
  });

  it('is false for an empty list', () => {
    expect(hasInProgressScheduledExecution([])).toBe(false);
  });

  it('is false when every row is terminal', () => {
    expect(
      hasInProgressScheduledExecution([{ status: 'success' }, { status: 'failure' }, { status: 'partial_failure' }]),
    ).toBe(false);
  });
});
