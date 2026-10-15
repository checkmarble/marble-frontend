import { describe, expect, it } from 'vitest';

import { getTimestampExtractMonths, getTimestampExtractWeekdays } from './timestampExtractLabels';

describe('timestamp extract labels', () => {
  it('generates January through December in UTC', () => {
    expect(getTimestampExtractMonths('en')).toEqual([
      { value: 1, label: 'Jan' },
      { value: 2, label: 'Feb' },
      { value: 3, label: 'Mar' },
      { value: 4, label: 'Apr' },
      { value: 5, label: 'May' },
      { value: 6, label: 'Jun' },
      { value: 7, label: 'Jul' },
      { value: 8, label: 'Aug' },
      { value: 9, label: 'Sep' },
      { value: 10, label: 'Oct' },
      { value: 11, label: 'Nov' },
      { value: 12, label: 'Dec' },
    ]);
  });

  it('generates Monday through Sunday in UTC', () => {
    expect(getTimestampExtractWeekdays('en')).toEqual([
      { value: 1, label: 'Mon' },
      { value: 2, label: 'Tue' },
      { value: 3, label: 'Wed' },
      { value: 4, label: 'Thu' },
      { value: 5, label: 'Fri' },
      { value: 6, label: 'Sat' },
      { value: 7, label: 'Sun' },
    ]);
  });
});
