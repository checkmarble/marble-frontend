import { FormatContext } from '@app-builder/contexts/FormatContext';
import { type IsMultipleOfFilterAstNode } from '@app-builder/models/astNode/aggregation';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { useTranslation } from 'react-i18next';
import { Button, cn, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

import {
  type AggregationFilterEditModel,
  addTimestampExtractTimeRange,
  getTimestampExtractPartRanges,
  getTimestampExtractSelectedValues,
  type StandardAggregationFilterEditModel,
  setTimestampExtractPartRanges,
  setTimestampExtractSelectedValues,
  type TimestampExtractFilterEditModel,
  type TimestampExtractPart,
  type TimestampExtractRangeEditModel,
  timestampExtractParts,
  timestampExtractTimePart,
} from '../EditModal/modals/Aggregation/edit-model';
import { getTimestampExtractMonths, getTimestampExtractWeekdays } from './timestampExtractLabels';

type ComplexInlineAggregationFilterEditModel = StandardAggregationFilterEditModel | TimestampExtractFilterEditModel;

export function isComplexInlineFilter(
  filter: AggregationFilterEditModel,
): filter is ComplexInlineAggregationFilterEditModel {
  return filter.type === 'timestampExtract' || filter.filter.namedChildren.operator.constant === 'IsMultipleOf';
}

export function InlineFilterValue({
  filter,
  onChange,
}: {
  filter: ComplexInlineAggregationFilterEditModel;
  onChange: (filter: ComplexInlineAggregationFilterEditModel) => void;
}) {
  if (filter.type === 'standard') {
    const multipleOfFilter = filter.filter as IsMultipleOfFilterAstNode;

    return (
      <div className="flex gap-xs">
        {[10, 100, 1000, 10000, 100000].map((value) => {
          const isSelected = multipleOfFilter.namedChildren.value.constant === value;

          return (
            <Button
              key={`value_${value}`}
              variant={isSelected ? 'primary' : 'secondary'}
              appearance="filter"
              onClick={() => {
                onChange({
                  type: 'standard',
                  filter: {
                    ...multipleOfFilter,
                    namedChildren: {
                      ...multipleOfFilter.namedChildren,
                      value: NewConstantAstNode({ constant: value }),
                    },
                  },
                });
              }}
            >
              {value}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sm">
      <div className="grid grid-cols-[auto_1fr] gap-xs gap-y-sm">
        {timestampExtractParts.map((part) => (
          <TimestampExtractPartRow key={part} filter={filter} part={part} onChange={onChange} />
        ))}
      </div>
      <TimestampExtractTimeRanges filter={filter} onChange={onChange} />
    </div>
  );
}

function TimestampExtractTimeRanges({
  filter,
  onChange,
}: {
  filter: TimestampExtractFilterEditModel;
  onChange: (filter: TimestampExtractFilterEditModel) => void;
}) {
  const { t } = useTranslation(['scenarios']);
  const ranges = getTimestampExtractPartRanges(filter, timestampExtractTimePart);

  const updateRange = (index: number, boundary: 0 | 1, value: number) => {
    const nextRanges = ranges.map((range, rangeIndex) =>
      rangeIndex === index
        ? {
            ...range,
            // A start time after the current end would otherwise turn the selection into an overnight range.
            range:
              boundary === 0
                ? ([value, Math.max(value, range.range[1])] as [number, number])
                : ([range.range[0], value] as [number, number]),
          }
        : range,
    );
    onChange(setTimestampExtractPartRanges(filter, timestampExtractTimePart, nextRanges));
  };

  return (
    <div className="flex flex-col gap-sm">
      {ranges.map((range, index) => (
        <div
          key={`${range.source?.id ?? 'new'}-${index}`}
          className="grid grid-cols-[68px_96px_auto_96px_minmax(0,1fr)_auto] items-center gap-xs"
        >
          <span className="text-grey-secondary text-xs">
            {t(
              index === 0
                ? 'scenarios:edit_aggregation.time_range_between'
                : 'scenarios:edit_aggregation.time_range_or_between',
            )}
          </span>
          <TimeRangeSelect
            value={range.range[0]}
            onChange={(value) => updateRange(index, 0, value)}
            ariaLabel={t('scenarios:edit_aggregation.time_range_start')}
          />
          <span className="text-grey-secondary text-xs">{t('scenarios:edit_aggregation.time_range_and')}</span>
          <TimeRangeSelect
            value={range.range[1]}
            onChange={(value) => updateRange(index, 1, value)}
            ariaLabel={t('scenarios:edit_aggregation.time_range_end')}
            minimumHour={range.range[0]}
          />
          <span />
          <Button
            variant="secondary"
            appearance="link"
            mode="icon"
            size="small"
            aria-label={t('scenarios:edit_aggregation.remove_time_range')}
            onClick={() =>
              onChange(setTimestampExtractPartRanges(filter, timestampExtractTimePart, ranges.toSpliced(index, 1)))
            }
          >
            <Icon icon="delete" className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="secondary"
        appearance="link"
        size="small"
        className="self-start"
        onClick={() => onChange(addTimestampExtractTimeRange(filter))}
      >
        <Icon icon="plus" className="size-4" />
        {t('scenarios:edit_aggregation.add_time_range')}
      </Button>
      <TimestampExtractHourRangePreview ranges={ranges} />
    </div>
  );
}

function TimestampExtractHourRangePreview({ ranges }: { ranges: TimestampExtractRangeEditModel[] }) {
  const { t } = useTranslation(['scenarios']);
  const { activeHours, labelledHours, rangeEndHours, rangeStartHours } = getHourRangePreviewState(ranges);

  return (
    <div className="flex flex-col gap-xs" aria-hidden="true" data-testid="hour-range-preview">
      <div className="grid grid-cols-[22px_minmax(0,1fr)_22px] items-center gap-xs">
        <span className="text-grey-placeholder text-xs font-medium">
          {t('scenarios:edit_aggregation.timestamp_extract_previous_day')}
        </span>
        <div className="grid h-4 grid-cols-[repeat(24,minmax(0,1fr))] overflow-hidden rounded-sm border border-purple-border-light bg-purple-background-light">
          {Array.from({ length: 24 }, (_, hour) => (
            <span
              key={hour}
              data-hour={hour}
              data-active={activeHours.has(hour)}
              className="border-e border-purple-border-light bg-purple-background-light last:border-e-0 inline-flex items-center"
            >
              {activeHours.has(hour) ? (
                <span
                  className={cn(
                    'block size-full bg-purple-primary h-3',
                    rangeStartHours.has(hour) && 'rounded-s-[3px]',
                    rangeEndHours.has(hour) && 'rounded-e-[3px]',
                  )}
                />
              ) : null}
            </span>
          ))}
        </div>
        <span className="text-grey-placeholder text-xs font-medium">
          {t('scenarios:edit_aggregation.timestamp_extract_next_day')}
        </span>
      </div>
      <div className="grid grid-cols-[22px_minmax(0,1fr)_22px] gap-xs">
        <span />
        <div className="grid grid-cols-[repeat(24,minmax(0,1fr))]">
          {Array.from({ length: 24 }, (_, hour) => {
            const isLabelled = labelledHours.has(hour);

            return (
              <span
                key={hour}
                className={cn(
                  'text-center text-xs font-medium',
                  isLabelled && activeHours.has(hour) ? 'text-purple-primary' : 'text-grey-placeholder',
                )}
              >
                {isLabelled ? String(hour).padStart(2, '0') : ''}
              </span>
            );
          })}
        </div>
        <span />
      </div>
    </div>
  );
}

export function getHourRangePreviewState(ranges: TimestampExtractRangeEditModel[]) {
  const activeHours = new Set<number>();
  const labelledHours = new Set<number>();

  for (const {
    range: [start, end],
  } of ranges) {
    labelledHours.add(start);
    labelledHours.add(end);

    for (let hour = 0; hour < 24; hour += 1) {
      const isActive = start <= end ? hour >= start && hour <= end : hour >= start || hour <= end;
      if (isActive) activeHours.add(hour);
    }
  }

  const rangeStartHours = new Set<number>();
  const rangeEndHours = new Set<number>();
  const sortedActiveHours = [...activeHours].sort((left, right) => left - right);

  for (const hour of sortedActiveHours) {
    if (hour === 0 || !activeHours.has(hour - 1)) rangeStartHours.add(hour);
    if (hour === 23 || !activeHours.has(hour + 1)) rangeEndHours.add(hour);
  }

  return {
    activeHours: new Set(sortedActiveHours),
    labelledHours,
    rangeStartHours,
    rangeEndHours,
  };
}

function TimeRangeSelect({
  value,
  onChange,
  ariaLabel,
  minimumHour,
}: {
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  minimumHour?: number;
}) {
  return (
    <SelectV2<number>
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      placeholder="..."
      className="w-24"
      options={Array.from({ length: 24 }, (_, hour) => hour)
        .filter((hour) => minimumHour === undefined || hour >= minimumHour)
        .map((hour) => ({
          label: `${String(hour).padStart(2, '0')}:00`,
          value: hour,
        }))}
    />
  );
}

function TimestampExtractPartRow({
  filter,
  part,
  onChange,
}: {
  filter: TimestampExtractFilterEditModel;
  part: TimestampExtractPart;
  onChange: (filter: TimestampExtractFilterEditModel) => void;
}) {
  const { locale } = FormatContext.useValue();
  const values = part === 'month' ? getTimestampExtractMonths(locale) : getTimestampExtractWeekdays(locale);
  const selectedValues = getTimestampExtractSelectedValues(filter.ranges, part);

  return (
    <div className="grid grid-cols-subgrid col-span-full">
      <div className="flex items-center gap-xs">
        {values.map(({ value, label }) => {
          const isSelected = selectedValues.includes(value);

          return (
            <Button
              key={`${part}_${value}`}
              variant={isSelected ? 'primary' : 'secondary'}
              appearance="filter"
              onClick={() => {
                const nextSelectedValues = new Set(selectedValues);
                if (isSelected) {
                  nextSelectedValues.delete(value);
                } else {
                  nextSelectedValues.add(value);
                }
                onChange(setTimestampExtractSelectedValues(filter, part, nextSelectedValues));
              }}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
