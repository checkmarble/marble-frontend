import { describe, expect, it } from 'vitest';
import { isInvalidLifecycleDuration, parseLifecycleDuration, serializeLifecycleDuration } from './duration';

describe('lifecycle durations', () => {
  it.each([
    ['P3M', { value: 3, unit: 'months' }],
    ['P2Y', { value: 2, unit: 'years' }],
  ] as const)('parses supported duration %s', (duration, expected) => {
    expect(parseLifecycleDuration(duration)).toEqual(expected);
  });

  it('fills combined calendar durations using months', () => {
    expect(parseLifecycleDuration('P1Y2M')).toEqual({ value: 14, unit: 'months' });
  });

  it.each(['PT1H', 'not-a-duration'])('preserves unsupported duration %s', (duration) => {
    expect(parseLifecycleDuration(duration)).toEqual({ unit: 'months', rawValue: duration });
  });

  it.each([undefined, null])('uses an empty month value when no duration is configured', (duration) => {
    expect(parseLifecycleDuration(duration)).toEqual({ unit: 'months' });
  });

  it.each([
    [{ value: 3, unit: 'months' } as const, 'P3M'],
    [{ value: 2, unit: 'years' } as const, 'P2Y'],
    [{ unit: 'months', rawValue: 'PT1H' } as const, 'PT1H'],
    [{ unit: 'months' } as const, null],
  ])('serializes a form duration through Temporal', (duration, expected) => {
    expect(serializeLifecycleDuration(duration)).toBe(expected);
  });

  it('refuses to serialize malformed numeric input', () => {
    const duration = { unit: 'months', inputValue: 'not a number', invalid: true } as const;

    expect(isInvalidLifecycleDuration(duration)).toBe(true);
    expect(() => serializeLifecycleDuration(duration)).toThrow('Cannot serialize an invalid lifecycle duration');
  });
});
