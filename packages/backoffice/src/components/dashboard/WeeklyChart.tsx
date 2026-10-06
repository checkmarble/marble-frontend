import type { DashboardMode } from '@bo/schemas/dashboard';
import type { DashboardWeek } from 'marble-api';
import { useId } from 'react';

const WIDTH = 320;
const HEIGHT = 160;
const LEFT = 32;
const RIGHT = WIDTH - 8;
const TOP = 12;
const BOTTOM = HEIGHT - 26;

export function WeeklyChart({ weeks, mode, label }: { weeks: DashboardWeek[]; mode: DashboardMode; label: string }) {
  const chartId = useId();
  const knownValues = weeks.flatMap((week) => (week[mode] === null ? [] : [week[mode]]));
  const maximum = Math.max(1, ...knownValues);
  const step = (RIGHT - LEFT) / Math.max(weeks.length, 1);
  const x = (index: number) => LEFT + step * (index + 0.5);
  const y = (value: number) => BOTTOM - (value / maximum) * (BOTTOM - TOP);
  const measure = mode === 'all' ? 'listed records' : 'new records';
  const hasPartialWeeks = weeks.some((week) => week.partial);
  const lastWeek = weeks.at(-1);

  return (
    <div className="flex flex-col gap-xs">
      {knownValues.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-grey-border px-md text-center text-xs text-grey-secondary">
          Historical data is unavailable for this period.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-labelledby={`${chartId}-title ${chartId}-description`}
          className="w-full text-purple-primary"
        >
          <title id={`${chartId}-title`}>
            {label}: weekly {measure}
          </title>
          <desc id={`${chartId}-description`}>
            Weeks start on Monday in UTC. Missing values are gaps. Outlined observations are partial weeks. Exact values
            are available in the weekly data table below.
          </desc>
          {[0, maximum].map((value) => (
            <g key={value} className="text-grey-border">
              <line x1={LEFT} x2={RIGHT} y1={y(value)} y2={y(value)} stroke="currentColor" strokeWidth="1" />
              <text x={LEFT - 5} y={y(value) + 4} textAnchor="end" fontSize="10" className="fill-grey-secondary">
                {value}
              </text>
            </g>
          ))}
          {weeks.map((week, index) => {
            const value = week[mode];
            if (value === null) return null;
            const previous = index > 0 ? weeks[index - 1]?.[mode] : null;
            const title = `${formatDate(week.start)} UTC: ${value} ${measure}${week.partial ? ' (partial week)' : ''}`;

            return (
              <g key={week.start}>
                {mode === 'all' ? (
                  <>
                    {previous !== null && previous !== undefined ? (
                      <line
                        x1={x(index - 1)}
                        y1={y(previous)}
                        x2={x(index)}
                        y2={y(value)}
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    ) : null}
                    <circle
                      cx={x(index)}
                      cy={y(value)}
                      r="3"
                      fill={week.partial ? 'none' : 'currentColor'}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <title>{title}</title>
                    </circle>
                  </>
                ) : (
                  <rect
                    x={x(index) - Math.min(step * 0.65, 18) / 2}
                    y={y(value) - (value === 0 ? 1 : 0)}
                    width={Math.min(step * 0.65, 18)}
                    height={Math.max(BOTTOM - y(value), 1)}
                    fill={week.partial ? 'none' : 'currentColor'}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    rx="1"
                  >
                    <title>{title}</title>
                  </rect>
                )}
              </g>
            );
          })}
          <text x={LEFT} y={HEIGHT - 5} fontSize="10" className="fill-grey-secondary">
            {weeks[0] ? formatShortDate(weeks[0].start) : ''}
          </text>
          <text x={RIGHT} y={HEIGHT - 5} textAnchor="end" fontSize="10" className="fill-grey-secondary">
            {lastWeek ? formatShortDate(lastWeek.start) : ''}
          </text>
        </svg>
      )}

      <details className="text-xs text-grey-secondary">
        <summary className="w-fit cursor-pointer rounded-sm py-xs hover:text-grey-primary">Weekly data</summary>
        <div className="max-h-64 overflow-auto rounded-md border border-grey-border" tabIndex={0}>
          <table className="w-full text-left tabular-nums">
            <caption className="sr-only">
              {label}: {measure} by week, UTC
            </caption>
            <thead>
              <tr className="border-b border-grey-border">
                <th scope="col" className="p-xs font-medium">
                  Interval (UTC)
                </th>
                <th scope="col" className="p-xs font-medium">
                  {mode === 'all' ? 'All' : 'New'}
                </th>
                <th scope="col" className="p-xs font-medium">
                  Period
                </th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={week.start} className="border-b border-grey-border last:border-0">
                  <th scope="row" className="p-xs font-normal">
                    <span className="block">{formatDate(week.start)}</span>
                    <span className="block text-2xs">Ends {formatDateTime(week.end)}</span>
                  </th>
                  <td className="p-xs">{week[mode] === null ? 'Unavailable' : week[mode]}</td>
                  <td className="p-xs" title={`Interval ends ${formatDateTime(week.end)} UTC`}>
                    {week.partial ? 'Partial week' : 'Full week'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hasPartialWeeks ? (
          <p className="pt-xs">Partial weeks contain only part of the week. Unavailable intervals have no count.</p>
        ) : null}
      </details>
    </div>
  );
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(
    new Date(value),
  );
}
