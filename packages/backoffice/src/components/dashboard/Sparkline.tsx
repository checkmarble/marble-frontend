import { useElementWidth } from '@bo/hooks/useElementWidth';
import type { SeriesPoint } from '@bo/utils/dashboard-indicator';
import { useRef } from 'react';

/** Axis-less trend line in the de-emphasis grey, with the latest known week as an accent end-dot. */
export function Sparkline({ points, label, height }: { points: SeriesPoint[]; label: string; height: number }) {
  const container = useRef<HTMLDivElement>(null);
  const width = useElementWidth(container);
  const known = points.flatMap((point) => (point.value === null ? [] : [point.value]));
  const lastKnown = points.findLastIndex((point) => point.value !== null);
  const min = Math.min(...known);
  const max = Math.max(...known, min + 1);
  const band = width / Math.max(points.length, 1);
  const cx = (index: number) => band * (index + 0.5);
  const y = (value: number) => 4 + (height - 8) * (1 - (value - min) / (max - min));
  const path = points
    .map((point, index) =>
      point.value === null
        ? ''
        : `${index > 0 && points[index - 1]?.value !== null ? 'L' : 'M'}${cx(index)},${y(point.value)}`,
    )
    .join('');
  const end = points[lastKnown];

  return (
    <div ref={container} className="w-full" style={{ height }}>
      {width > 0 && known.length > 0 ? (
        <svg width={width} height={height} role="img" aria-label={`${label} trend`} className="text-purple-primary">
          <path
            d={path}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            className="stroke-grey-secondary opacity-50"
          />
          {end && end.value !== null ? (
            <circle
              cx={cx(lastKnown)}
              cy={y(end.value)}
              r="4"
              strokeWidth="2"
              className="fill-current stroke-surface-card"
            />
          ) : null}
        </svg>
      ) : null}
      {known.length === 0 ? (
        <div className="flex h-full items-center text-xs text-grey-secondary">No history</div>
      ) : null}
    </div>
  );
}
