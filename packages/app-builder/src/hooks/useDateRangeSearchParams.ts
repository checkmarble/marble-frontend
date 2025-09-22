import { useSearchParams } from '@remix-run/react';
import { subMonths } from 'date-fns';
import { useCallback, useMemo } from 'react';

type StaticDateRange = { type: 'static'; startDate: string; endDate: string };
type DynamicDateRange = { type: 'dynamic'; fromNow: string };
type DateRangeFilterParam = StaticDateRange | DynamicDateRange | null | undefined;

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
  const encodeBase64Url = (value: string) =>
    btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  const decodeBase64Url = (value: string) => {
    const withPadding = value.replace(/-/g, '+').replace(/_/g, '/');
    const pad = withPadding.length % 4 ? 4 - (withPadding.length % 4) : 0;
    const padded = withPadding + '='.repeat(pad);
    return atob(padded);
  };

  const { start, end, compareStart, compareEnd } = useMemo(() => {
    const q = searchParams.get('q');
    if (q) {
      try {
        const parsed = JSON.parse(decodeBase64Url(q)) as {
          start?: string;
          end?: string;
          compareStart?: string;
          compareEnd?: string;
        };
        if (parsed.start && parsed.end) {
          return {
            start: parsed.start,
            end: parsed.end,
            compareStart: parsed.compareStart,
            compareEnd: parsed.compareEnd,
          };
        }
      } catch {
        // ignore malformed q
      }
    }
    const defaults = getDefaultRange();
    return {
      start: defaults.start,
      end: defaults.end,
      compareStart: undefined,
      compareEnd: undefined,
    };
  }, [searchParams]);

  const setDateRangeFilter = useCallback(
    (dateRange: DateRangeFilterParam) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          const writeQ = (payload: {
            start: string;
            end: string;
            compareStart?: string;
            compareEnd?: string;
          }) => {
            params.set('q', encodeBase64Url(JSON.stringify(payload)));
            params.delete('start');
            params.delete('end');
            params.delete('compareStart');
            params.delete('compareEnd');
          };

          if (!dateRange) {
            const d = getDefaultRange();
            writeQ({ start: d.start, end: d.end });
            return params;
          }

          if (dateRange.type === 'static') {
            const current = { start: dateRange.startDate, end: dateRange.endDate };
            // retain existing compare if any
            const qv = params.get('q');
            if (qv) {
              try {
                const parsed = JSON.parse(decodeBase64Url(qv)) as {
                  compareStart?: string;
                  compareEnd?: string;
                };
                writeQ({ ...current, ...parsed });
                return params;
              } catch {
                // ignore malformed q
              }
            }
            writeQ(current);
            return params;
          }

          // dynamic
          try {
            const now = new Date();
            const fallback = subMonths(now, 1);
            let computedStart = fallback;
            if (dateRange.fromNow.includes('M')) {
              const match = dateRange.fromNow.match(/-P(\d+)M|P-?(\d+)M/i);
              const months = match ? Number(match[1] ?? match[2]) : undefined;
              if (months && months > 0) {
                computedStart = subMonths(now, months);
              }
            } else if (dateRange.fromNow.includes('D')) {
              const match = dateRange.fromNow.match(/-P(\d+)D|P-?(\d+)D/i);
              const days = match ? Number(match[1] ?? match[2]) : undefined;
              if (days && days > 0) {
                const ms = 24 * 60 * 60 * 1000 * days;
                computedStart = new Date(now.getTime() - ms);
              }
            }
            writeQ({ start: computedStart.toISOString(), end: now.toISOString() });
          } catch {
            const d = getDefaultRange();
            writeQ({ start: d.start, end: d.end });
          }
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setCompareRange = useCallback(
    (range: { startDate: string; endDate: string } | null | undefined) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          const qv = params.get('q');
          const base = (() => {
            if (qv) {
              try {
                const parsed = JSON.parse(decodeBase64Url(qv)) as { start?: string; end?: string };
                if (parsed.start && parsed.end) return parsed;
              } catch {
                // ignore malformed q
              }
            }
            const defaults = getDefaultRange();
            return { start: defaults.start, end: defaults.end };
          })();

          const payload = range
            ? { ...base, compareStart: range.startDate, compareEnd: range.endDate }
            : { ...base, compareStart: undefined, compareEnd: undefined };

          params.set('q', encodeBase64Url(JSON.stringify(payload)));
          params.delete('compareStart');
          params.delete('compareEnd');
          params.delete('start');
          params.delete('end');
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return {
    start,
    end,
    compareStart,
    compareEnd,
    setDateRangeFilter,
    setCompareRange,
  } as const;
}
