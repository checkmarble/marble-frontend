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

  const { range, compareRange } = useMemo(() => {
    const q = searchParams.get('q');
    if (q) {
      try {
        const obj = JSON.parse(decodeBase64Url(q)) as {
          range?: { start?: string; end?: string } | null;
          compareRange?: { start?: string; end?: string } | null;
        };
        // New shape
        if ('range' in obj && obj.range?.start && obj.range?.end) {
          return {
            range: { start: obj.range.start, end: obj.range.end },
            compareRange:
              obj.compareRange?.start && obj.compareRange?.end
                ? { start: obj.compareRange.start, end: obj.compareRange.end }
                : null,
          } as const;
        }
        // otherwise fallthrough to defaults below
      } catch {
        // ignore malformed q
      }
    }
    const defaults = getDefaultRange();
    return { range: { start: defaults.start, end: defaults.end }, compareRange: null } as const;
  }, [searchParams]);

  const setDateRangeFilter = useCallback(
    (dateRange: DateRangeFilterParam) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          const writeQ = (payload: {
            range: { start: string; end: string };
            compareRange?: { start: string; end: string } | null;
          }) => {
            params.set('q', encodeBase64Url(JSON.stringify(payload)));
          };

          if (!dateRange) {
            const d = getDefaultRange();
            // Clear to defaults; preserve existing compareRange if any
            const qv = params.get('q');
            let existingCompare: { start: string; end: string } | null = null;
            if (qv) {
              try {
                const parsed = JSON.parse(decodeBase64Url(qv)) as {
                  compareRange?: { start?: string; end?: string } | null;
                };
                if (parsed.compareRange?.start && parsed.compareRange?.end) {
                  existingCompare = {
                    start: parsed.compareRange.start,
                    end: parsed.compareRange.end,
                  };
                }
              } catch {
                // ignore
              }
            }
            writeQ({ range: { start: d.start, end: d.end }, compareRange: existingCompare });
            return params;
          }

          if (dateRange.type === 'static') {
            const current = { start: dateRange.startDate, end: dateRange.endDate } as const;
            // retain existing compareRange if any
            const qv = params.get('q');
            if (qv) {
              try {
                const parsed = JSON.parse(decodeBase64Url(qv)) as {
                  compareRange?: { start?: string; end?: string } | null;
                };
                const compare =
                  parsed.compareRange?.start && parsed.compareRange?.end
                    ? { start: parsed.compareRange.start, end: parsed.compareRange.end }
                    : null;
                writeQ({ range: current, compareRange: compare });
                return params;
              } catch {
                // ignore malformed q
              }
            }
            writeQ({ range: current });
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
            // preserve existing compareRange if any
            const qv = params.get('q');
            let existingCompare: { start: string; end: string } | null = null;
            if (qv) {
              try {
                const parsed = JSON.parse(decodeBase64Url(qv)) as {
                  compareRange?: { start?: string; end?: string } | null;
                };
                if (parsed.compareRange?.start && parsed.compareRange?.end) {
                  existingCompare = {
                    start: parsed.compareRange.start,
                    end: parsed.compareRange.end,
                  };
                }
              } catch {
                // ignore
              }
            }
            writeQ({
              range: { start: computedStart.toISOString(), end: now.toISOString() },
              compareRange: existingCompare,
            });
          } catch {
            const d = getDefaultRange();
            writeQ({ range: { start: d.start, end: d.end } });
          }
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setCompareRange = useCallback(
    (dateRange: DateRangeFilterParam) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          const qv = params.get('q');
          const base = (() => {
            if (qv) {
              try {
                const parsed = JSON.parse(decodeBase64Url(qv)) as {
                  range?: { start?: string; end?: string } | null;
                };
                if (parsed.range?.start && parsed.range?.end) {
                  return { start: parsed.range.start, end: parsed.range.end } as const;
                }
              } catch {
                // ignore malformed q
              }
            }
            const defaults = getDefaultRange();
            return { start: defaults.start, end: defaults.end };
          })();

          let compare: { start: string; end: string } | null = null;
          if (!dateRange) {
            compare = null;
          } else if (dateRange.type === 'static') {
            compare = { start: dateRange.startDate, end: dateRange.endDate };
          } else if (dateRange.type === 'dynamic') {
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
              compare = { start: computedStart.toISOString(), end: now.toISOString() };
            } catch {
              compare = null;
            }
          }

          const payload = {
            range: { start: base.start, end: base.end },
            compareRange: compare,
          } as const;

          params.set('q', encodeBase64Url(JSON.stringify(payload)));
          // cleanup legacy flat params if present
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
    range,
    compareRange,
    setDateRangeFilter,
    setCompareRange,
  } as const;
}
