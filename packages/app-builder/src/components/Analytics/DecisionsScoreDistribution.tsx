import type { DecisionsScoreDistribution as DecisionsScoreDistributionModel } from '@app-builder/models/analytics';
import { ResponsiveLine } from '@nivo/line';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

/**
 * Calculates the optimal Y-axis range to focus on the majority of data,
 * ignoring extreme outliers.
 * * @param {Array} data - The Nivo data array (array of objects with {x, y})
 * @param {number} percentile - The cutoff percentile (0.90 means keep 90% of points)
 * @param {number} padding - Visual padding ratio (0.1 = 10% breathing room)
 */
const getFocusRange = (data: { x: number; y: number }[], percentile = 0.9, padding = 0.1) => {
  // 1. Extract all Y values
  const values = data.map((d) => d.y).sort((a, b) => a - b);

  if (!values.length) return { min: 0, max: 100 };

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  // If the spread is small (less than 20%), we don't want to filter outliers
  if (maxVal - minVal < 20) {
    const range = maxVal - minVal;
    const suggestedMax = maxVal + range * padding;
    const suggestedMin = Math.max(0, minVal - range * padding);

    return {
      min: Math.floor(suggestedMin),
      max: Math.ceil(suggestedMax),
      hasOutliers: false,
    };
  }

  // 2. Find the index of the percentile cutoff
  // e.g., if 20 items, 0.90 * 20 = index 18
  const cutoffIndex = Math.floor(values.length * percentile);

  // Get the value at that index. This is our "rough max".
  // We ensure we at least take the median if the spread is weird.
  const outlierThreshold = values[cutoffIndex] ?? 0;

  // 3. Filter data to find the 'normal' min/max
  const normalValues = values.filter((v) => v <= outlierThreshold);

  const normalMinVal = Math.min(...normalValues);
  const normalMaxVal = Math.max(...normalValues);

  // 4. Add visual padding so the line doesn't hit the edges hard
  const range = normalMaxVal - normalMinVal;
  const suggestedMax = normalMaxVal + range * padding;
  const suggestedMin = Math.max(0, normalMinVal - range * padding); // Assuming ratio >= 0

  return {
    min: Math.floor(suggestedMin),
    max: Math.ceil(suggestedMax),
    hasOutliers: values.some((v) => v > suggestedMax), // Flag to turn on your dashed line
  };
};

export const DecisionsScoreDistribution = ({ data }: { data: DecisionsScoreDistributionModel }) => {
  const { t } = useTranslation();
  const { bucketSize, min, max, hasOutliers } = useMemo(() => {
    const bucketSize = Math.abs((data[1]?.x ?? 0) - (data[0]?.x ?? 0));
    const { min, max, hasOutliers } = getFocusRange(data ?? []);
    return { bucketSize, min, max, hasOutliers };
  }, [data]);

  const values = useMemo(() => {
    const rawData = data ?? [];
    if (!rawData.length) return [];
    // return rawData;
    const lastPoint = rawData[rawData.length - 1];
    if (!lastPoint) return rawData;
    if (bucketSize === 0) return rawData;
    return [{ x: rawData[0]!.x, y: min }, ...rawData, { x: lastPoint.x + bucketSize, y: min }];
  }, [data]);

  const [isExpanded, setIsExpanded] = useState(false);

  const handleExportCsv = () => {
    if (!data) return;
    const headers = ['score', 'percentage'];
    const lines = data.map(({ x, y }) => [x, y]);
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8,' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decisions_score_distribution.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-semibold">{t('analytics:decisions_score_distribution.title')}</h2>
        <ButtonV2 variant="secondary" className="flex items-center gap-v2-sm" onClick={handleExportCsv}>
          <Icon icon="download" className="size-4" />
          {t('analytics:export.button')}
        </ButtonV2>
      </div>
      <div className="bg-white border border-grey-90 rounded-lg p-v2-md shadow-sm mt-v2-sm relative">
        <div className="flex w-full h-[500px] flex-col items-end justify-end gap-v2-md">
          <div className="flex justify-between w-full items-baseline">
            <span className="text-s">{t('analytics:decisions_score_distribution.left-axis-legend')}</span>
            <ButtonV2
              variant="secondary"
              className="flex items-center gap-v2-sm"
              disabled={!hasOutliers}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Icon icon={isExpanded ? 'unfold_less' : 'unfold_more'} className="size-4" />
              {isExpanded ? 'Zoom in' : 'Zoom out'}
            </ButtonV2>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveLine
              data={[
                {
                  id: 'distribution',
                  data: values,
                },
              ]}
              margin={{ top: 5, right: 10, bottom: 50, left: 50 }}
              xScale={{
                type: 'linear',
                min: values[0]?.x ?? 0,
                max: values[values.length - 1]?.x ?? 100,
              }}
              yScale={{
                type: 'linear',
                min,
                max: isExpanded ? undefined : max,
              }}
              curve="stepAfter"
              enableArea={false}
              areaBaselineValue={Number(min)}
              enablePoints={false}
              useMesh={true}
              theme={{
                grid: { line: { stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '4 4' } },
                axis: {
                  legend: {
                    text: {
                      fontSize: '14px',
                    },
                  },
                },
              }}
              axisLeft={{
                format: (value: number) => `${value} %`,
              }}
              axisBottom={{
                legendPosition: 'end',
                legend: t('analytics:decisions_score_distribution.bottom-axis-legend'),
                legendOffset: 40,
              }}
              yFormat={(value: number) => `${Number(value).toFixed(1)}%`}
              tooltip={({ point }: { point: any }) => {
                if (point.absIndex === 0 || point.absIndex > data.length) {
                  return null;
                }
                return (
                  <div className="flex flex-col gap-v2-xs w-auto max-w-max bg-white p-v2-sm rounded-lg border border-grey-90 shadow-sm whitespace-nowrap">
                    <div className="flex items-center gap-v2-sm">
                      <strong className="text-grey-00 font-semibold">{`Score: ${point.data.x.toFixed(0)}->${(point.data.x + bucketSize).toFixed(0)}`}</strong>
                    </div>
                    <div className="text-s text-grey-60">{`${point.data.y.toFixed(2)} %`}</div>
                  </div>
                );
              }}
              colors={['#6D28D9']}
              motionConfig={{
                mass: 1,
                tension: 170,
                friction: 8,
                clamp: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
