import { useSearchParams } from '@remix-run/react';
import { subDays, subMonths } from 'date-fns';
import { useCallback, useMemo } from 'react';

type StaticDateRange = { type: 'static'; startDate: string; endDate: string };
type DynamicDateRange = { type: 'dynamic'; fromNow: string };
type DateRangeFilterParam = StaticDateRange | DynamicDateRange | null | undefined;
type IsoRange = { start: string; end: string };

function toIso(date: Date): string {
  return date.toISOString();
}

function getDefaultRange(): { start: string; end: string } {
  const end = new Date();
  const start = subMonths(end, 1);
  return { start: toIso(start), end: toIso(end) };
}

export function useDateRangeSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const parseQ = useCallback(
    (qValue: string | null): { range: IsoRange; compareRange: IsoRange | null } => {
      if (qValue) {
        try {
          const obj = JSON.parse(atob(qValue)) as {
            range?: { start?: string; end?: string } | null;
            compareRange?: { start?: string; end?: string } | null;
          };
          if (obj?.range?.start && obj?.range?.end) {
            return {
              range: { start: obj.range.start, end: obj.range.end },
              compareRange:
                obj.compareRange?.start && obj.compareRange?.end
                  ? { start: obj.compareRange.start, end: obj.compareRange.end }
                  : null,
            };
          }
        } catch {
          // ignore malformed q
        }
      }
      const defaults = getDefaultRange();
      return { range: { start: defaults.start, end: defaults.end }, compareRange: null };
    },
    [],
  );

  const { range, compareRange } = useMemo(
    () => parseQ(searchParams.get('q')),
    [parseQ, searchParams],
  );

  const computeDynamicRange = useCallback((fromNow: string): IsoRange => {
    const now = new Date();
    const match = /-?P-?(\d+)([MD])/i.exec(fromNow);
    const amount = match && match[1] ? Number(match[1]) : 1;
    const unit = match && match[2] ? match[2].toUpperCase() : 'M';
    const startDate = unit === 'D' ? subDays(now, amount) : subMonths(now, amount);
    return { start: toIso(startDate), end: toIso(now) };
  }, []);

  const writeQ = useCallback(
    (prevParams: URLSearchParams, next: { range?: IsoRange; compareRange?: IsoRange | null }) => {
      const params = new URLSearchParams(prevParams);
      const current = parseQ(params.get('q'));
      const nextPayload = {
        range: next.range ?? current.range,
        compareRange: next.compareRange === undefined ? current.compareRange : next.compareRange,
      };
      params.set('q', btoa(JSON.stringify(nextPayload)));
      params.delete('compareStart');
      params.delete('compareEnd');
      params.delete('start');
      params.delete('end');
      return params;
    },
    [parseQ],
  );

  const setDateRangeFilter = useCallback(
    (dateRange: DateRangeFilterParam) => {
      setSearchParams(
        (prev) => {
          if (!dateRange) {
            const defaults = getDefaultRange();
            return writeQ(prev, { range: defaults, compareRange: undefined });
          }

          if (dateRange.type === 'static') {
            const nextRange = { start: dateRange.startDate, end: dateRange.endDate } as IsoRange;
            return writeQ(prev, { range: nextRange, compareRange: undefined });
          }

          const dynamicRange = computeDynamicRange(dateRange.fromNow);
          return writeQ(prev, { range: dynamicRange, compareRange: undefined });
        },
        { replace: true },
      );
    },
    [computeDynamicRange, setSearchParams, writeQ],
  );

  const setCompareRange = useCallback(
    (dateRange: DateRangeFilterParam) => {
      setSearchParams(
        (prev) => {
          let nextCompare: IsoRange | null;
          if (!dateRange) {
            nextCompare = null;
          } else if (dateRange.type === 'static') {
            nextCompare = { start: dateRange.startDate, end: dateRange.endDate };
          } else {
            nextCompare = computeDynamicRange(dateRange.fromNow);
          }

          return writeQ(prev, { compareRange: nextCompare });
        },
        { replace: true },
      );
    },
    [computeDynamicRange, setSearchParams, writeQ],
  );

  return {
    range,
    compareRange,
    setDateRangeFilter,
    setCompareRange,
  } as const;
}
