import { useElementWidth } from '@bo/hooks/useElementWidth';
import { formatCount, formatDate, formatShortDate, type SeriesPoint } from '@bo/utils/dashboard-indicator';
import { useId, useRef, useState } from 'react';
import { cn } from 'ui-design-system';

const MARGIN = { top: 8, right: 8, bottom: 22, left: 36 };

type TrendChartProps = {
  points: SeriesPoint[];
  kind: 'line' | 'bars';
  label: string;
  /** Unit read out in the tooltip, e.g. "listed" or "new". */
  measure: string;
  height: number;
};

/**
 * Weekly single-series chart. Weeks without history are shaded rather than drawn as zero, partial weeks
 * are hollow points or lighter bars. Pointer hover and the arrow keys read each week; the weekly data
 * table is the full equivalent.
 */
export function TrendChart({ points, kind, label, measure, height }: TrendChartProps) {
  const container = useRef<HTMLDivElement>(null);
  const width = useElementWidth(container);
  const [active, setActive] = useState<number | null>(null);
  const titleId = useId();
  const known = points.flatMap((point) => (point.value === null ? [] : [point.value]));

  if (known.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-md bg-grey-background-light px-md text-center text-xs text-grey-secondary"
        style={{ height }}
      >
        No audit history for this period.
      </div>
    );
  }

  const ticks = niceTicks(Math.max(...known));
  const max = ticks.at(-1) ?? 1;
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = height - MARGIN.top - MARGIN.bottom;
  const base = MARGIN.top + plotHeight;
  const band = plotWidth / points.length;
  const cx = (index: number) => MARGIN.left + band * (index + 0.5);
  const y = (value: number) => MARGIN.top + plotHeight * (1 - value / max);
  const barWidth = Math.max(Math.min(band - 2, 24), 1);
  const lastKnown = points.findLastIndex((point) => point.value !== null);
  const xLabels = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];
  const linePath = points
    .map((point, index) => {
      if (point.value === null) return '';
      return `${index > 0 && points[index - 1]?.value !== null ? 'L' : 'M'}${cx(index)},${y(point.value)}`;
    })
    .join('');
  const activePoint = active === null ? undefined : points[active];
  const clamp = (index: number) => Math.min(Math.max(index, 0), points.length - 1);

  return (
    <div ref={container} className="relative w-full" style={{ height }}>
      {width > 0 ? (
        <svg
          width={width}
          height={height}
          role="img"
          aria-labelledby={titleId}
          tabIndex={0}
          className="rounded-sm text-purple-primary outline-none focus-visible:ring-2 focus-visible:ring-purple-primary"
          onPointerMove={(event) => {
            const left = event.currentTarget.getBoundingClientRect().left;
            setActive(clamp(Math.floor((event.clientX - left - MARGIN.left) / band)));
          }}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive(lastKnown)}
          onBlur={() => setActive(null)}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();
            const delta = event.key === 'ArrowLeft' ? -1 : 1;
            setActive((current) => clamp((current ?? lastKnown) + delta));
          }}
        >
          <title id={titleId}>
            {label}: weekly {measure}. Use the arrow keys to read each week; the weekly data table lists every value.
          </title>
          {nullRuns(points).map((run) => (
            <g key={run.from}>
              <rect
                x={MARGIN.left + band * run.from}
                y={MARGIN.top}
                width={band * run.length}
                height={plotHeight}
                className="fill-grey-background-light"
              />
              {band * run.length > 72 ? (
                <text
                  x={MARGIN.left + band * (run.from + run.length / 2)}
                  y={MARGIN.top + 14}
                  textAnchor="middle"
                  fontSize="10"
                  className="fill-grey-secondary"
                >
                  No history
                </text>
              ) : null}
            </g>
          ))}
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                x2={width - MARGIN.right}
                y1={y(tick)}
                y2={y(tick)}
                className="stroke-grey-border"
              />
              <text
                x={MARGIN.left - 6}
                y={y(tick) + 3}
                textAnchor="end"
                fontSize="10"
                className="fill-grey-secondary tabular-nums"
              >
                {formatCount(tick)}
              </text>
            </g>
          ))}
          {xLabels.map((index, position) => {
            const point = points[index];
            if (!point) return null;
            const anchor = position === 0 ? 'start' : position === xLabels.length - 1 ? 'end' : 'middle';
            const x = anchor === 'start' ? MARGIN.left : anchor === 'end' ? width - MARGIN.right : cx(index);
            return (
              <text key={index} x={x} y={height - 6} textAnchor={anchor} fontSize="10" className="fill-grey-secondary">
                {formatShortDate(point.start)}
              </text>
            );
          })}

          {kind === 'bars'
            ? points.map((point, index) => {
                if (point.value === null) return null;
                const x = cx(index) - barWidth / 2;
                if (point.value === 0) {
                  return (
                    <rect
                      key={point.start}
                      x={x}
                      y={base - 2}
                      width={barWidth}
                      height={2}
                      className="fill-grey-secondary opacity-40"
                    />
                  );
                }
                return (
                  <path
                    key={point.start}
                    d={barPath(x, y(point.value), barWidth, base)}
                    fill="currentColor"
                    opacity={point.partial ? 0.35 : active === index ? 0.8 : 1}
                  />
                );
              })
            : null}

          {kind === 'line' ? (
            <>
              {active !== null ? (
                <line x1={cx(active)} x2={cx(active)} y1={MARGIN.top} y2={base} className="stroke-grey-secondary" />
              ) : null}
              <path
                d={linePath}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {points.map((point, index) => {
                if (point.value === null || (!point.partial && index !== lastKnown && index !== active)) return null;
                return (
                  <circle
                    key={point.start}
                    cx={cx(index)}
                    cy={y(point.value)}
                    r="4"
                    strokeWidth="2"
                    className={cn(
                      point.partial ? 'fill-surface-card stroke-current' : 'fill-current stroke-surface-card',
                    )}
                  />
                );
              })}
            </>
          ) : null}
        </svg>
      ) : null}

      {activePoint && active !== null && width > 0 ? (
        <div
          className="pointer-events-none absolute top-0 z-10 flex -translate-x-1/2 flex-col gap-2xs whitespace-nowrap rounded-md border border-grey-border bg-surface-card px-sm py-xs text-xs shadow-md"
          style={{ left: Math.min(Math.max(cx(active), 70), width - 70) }}
        >
          <span className="text-s font-semibold text-grey-primary">
            {activePoint.value === null ? 'No history' : `${formatCount(activePoint.value)} ${measure}`}
          </span>
          <span className="text-grey-secondary">
            Week of {formatDate(activePoint.start)}
            {activePoint.partial ? ' · partial' : ''}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function niceTicks(maximum: number) {
  if (maximum <= 0) return [0, 1];
  const raw = maximum / 3;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = Math.max(1, ([1, 2, 5, 10].find((factor) => factor * power >= raw) ?? 10) * power);
  const ticks: number[] = [];
  for (let tick = 0; tick < maximum + step; tick += step) ticks.push(tick);
  return ticks;
}

function nullRuns(points: SeriesPoint[]) {
  const runs: Array<{ from: number; length: number }> = [];
  points.forEach((point, index) => {
    if (point.value !== null) return;
    const last = runs.at(-1);
    if (last && last.from + last.length === index) last.length += 1;
    else runs.push({ from: index, length: 1 });
  });
  return runs;
}

/** A bar with a 4px rounded data-end, square at the baseline. */
function barPath(x: number, y: number, width: number, base: number) {
  const radius = Math.min(4, width / 2, base - y);
  return `M${x},${base}V${y + radius}Q${x},${y} ${x + radius},${y}H${x + width - radius}Q${x + width},${y} ${x + width},${y + radius}V${base}Z`;
}
