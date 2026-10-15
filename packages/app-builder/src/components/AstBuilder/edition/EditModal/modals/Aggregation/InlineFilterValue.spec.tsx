import { FormatContext } from '@app-builder/contexts/FormatContext';
import type { TimestampExtractFilterEditModel, TimestampExtractRangeEditModel } from './edit-model';
import '@app-builder/tests/setup/i18next';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import i18next from 'i18next';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { getHourRangePreviewState, InlineFilterValue } from '../../../AggregationFilters/InlineFilterValue';

mockResizeObserver();
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

function timestampFilter(ranges: TimestampExtractRangeEditModel[] = []): TimestampExtractFilterEditModel {
  return {
    type: 'timestampExtract',
    tableName: 'transactions',
    fieldName: 'occurred_at',
    ranges,
    sourceFilters: [],
  };
}

describe('InlineFilterValue TimestampExtract', () => {
  it('starts without time ranges and adds a midnight range', async () => {
    const onChange = vi.fn();

    render(
      <I18nextProvider i18n={i18next}>
        <FormatContext.Provider value={{ locale: 'en', timezone: 'UTC' }}>
          <InlineFilterValue filter={timestampFilter()} onChange={onChange} />
        </FormatContext.Provider>
      </I18nextProvider>,
    );

    expect(screen.queryByLabelText('Start time')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Add time range' }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ranges: [expect.objectContaining({ part: 'hour', range: [0, 0] })],
      }),
    );
  });

  it('clears the previous range when a new start is after its end', async () => {
    const onChange = vi.fn();

    render(
      <I18nextProvider i18n={i18next}>
        <FormatContext.Provider value={{ locale: 'en', timezone: 'UTC' }}>
          <InlineFilterValue filter={timestampFilter([{ part: 'hour', range: [8, 11] }])} onChange={onChange} />
        </FormatContext.Provider>
      </I18nextProvider>,
    );

    await userEvent.click(screen.getByRole('combobox', { name: 'Start time' }));
    await userEvent.click(screen.getByRole('option', { name: '14:00' }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ ranges: [expect.objectContaining({ part: 'hour', range: [14, 14] })] }),
    );
  });

  it('only offers end hours at or after the selected start', async () => {
    render(
      <I18nextProvider i18n={i18next}>
        <FormatContext.Provider value={{ locale: 'en', timezone: 'UTC' }}>
          <InlineFilterValue filter={timestampFilter([{ part: 'hour', range: [8, 11] }])} onChange={vi.fn()} />
        </FormatContext.Provider>
      </I18nextProvider>,
    );

    await userEvent.click(screen.getByRole('combobox', { name: 'End time' }));

    expect(screen.queryByRole('option', { name: '07:00' })).toBeNull();
    expect(screen.getByRole('option', { name: '08:00' })).toBeTruthy();
  });

  it('renders no active segments when no Hour range exists', () => {
    const { activeHours } = getHourRangePreviewState([]);

    expect(activeHours).toEqual(new Set());
  });

  it('rounds only the outer cells of a contiguous Hour range', () => {
    const { rangeEndHours, rangeStartHours } = getHourRangePreviewState([{ part: 'hour', range: [8, 11] }]);

    expect([...rangeStartHours]).toEqual([8]);
    expect([...rangeEndHours]).toEqual([11]);
  });

  it('highlights a single Hour when both endpoints are equal', () => {
    const { activeHours, rangeEndHours, rangeStartHours } = getHourRangePreviewState([{ part: 'hour', range: [0, 0] }]);

    expect([...activeHours]).toEqual([0]);
    expect([...rangeStartHours]).toEqual([0]);
    expect([...rangeEndHours]).toEqual([0]);
  });

  it('applies active fill and range rounding to the inner segment only', () => {
    const { container } = render(
      <I18nextProvider i18n={i18next}>
        <FormatContext.Provider value={{ locale: 'en', timezone: 'UTC' }}>
          <InlineFilterValue filter={timestampFilter([{ part: 'hour', range: [8, 11] }])} onChange={vi.fn()} />
        </FormatContext.Provider>
      </I18nextProvider>,
    );

    const startCell = container.querySelector('[data-hour="8"]');
    const startFill = startCell?.firstElementChild;
    const endCell = container.querySelector('[data-hour="11"]');
    const endFill = endCell?.firstElementChild;

    expect(startCell?.classList.contains('bg-purple-background-light')).toBe(true);
    expect(startFill?.classList.contains('bg-purple-primary')).toBe(true);
    expect(startFill?.classList.contains('rounded-s-[3px]')).toBe(true);
    expect(endFill?.classList.contains('bg-purple-primary')).toBe(true);
    expect(endFill?.classList.contains('rounded-e-[3px]')).toBe(true);
  });
});
