import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BirthdDateAverage } from './match-card-entity-components';
import { classifyBirthDate } from './match-card-utility-functions';

afterEach(cleanup);

describe('birth dates from customer data', () => {
  it.each([
    ['1991-05-01', 'full'],
    ['1991', 'year'],
    ['1991-02-30', null],
    ['31/12/1990', null],
    ['unknown', null],
  ])('classifies %s as %s', (value, kind) => {
    expect(classifyBirthDate(value)).toBe(kind);
  });

  it.each([['unknown'], ['N/A'], ['31/12/1990'], ['1991-02-30']])(
    'shows %s as written instead of crashing',
    (value) => {
      render(<BirthdDateAverage values={[value]} />);
      expect(screen.getByText(value)).toBeTruthy();
    },
  );
});
