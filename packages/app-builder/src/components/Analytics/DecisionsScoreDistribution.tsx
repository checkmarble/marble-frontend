import type { DecisionsScoreDistribution as DecisionsScoreDistributionModel } from '@app-builder/models/analytics';
import { ResponsiveLine } from '@nivo/line';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const DecisionsScoreDistribution = ({ data }: { data: DecisionsScoreDistributionModel | null }) => {
  const handleExportCsv = () => {
    if (!data) return;
    const headers = ['score', 'percentage'];
    const lines = data.stepSeries.map(({ x, y }) => [x, y]);
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
        <h2 className="text-h2 font-semibold">t('analytics:decisions_score_distribution.title')</h2>
        <ButtonV2 variant="secondary" className="flex items-center gap-v2-sm" onClick={handleExportCsv}>
          <Icon icon="download" className="size-4" />
          Export CSV
        </ButtonV2>
      </div>
      <div className="bg-white border border-grey-90 rounded-lg p-v2-md shadow-sm mt-v2-sm relative">
        <div className="flex w-full h-[500px] flex-col items-start gap-v2-md">
          <div className="flex-1 w-full">
            <ResponsiveLine
              data={series}
              margin={{ top: 5, right: 5, bottom: 24, left: 56 }}
              xScale={{ type: 'linear' }}
              yScale={{ type: 'linear', min: 0, max: 100 }}
              curve="stepAfter"
              enableArea={false}
              enablePoints={true}
              pointSize={6}
              useMesh={true}
              axisLeft={{
                legend: 'percentage',
                legendOffset: -50,
                format: (value: number) => `${Number(value).toFixed(0)}%`,
              }}
              axisBottom={{
                legend: 'score',
                legendOffset: 20,
              }}
              yFormat={(value: number) => `${Number(value).toFixed(1)}%`}
              tooltip={({ point }: { point: any }) => (
                <div className="flex flex-col gap-v2-xs w-auto max-w-max bg-white p-v2-sm rounded-lg border border-grey-90 shadow-sm whitespace-nowrap">
                  <div className="flex items-center gap-v2-sm">
                    <strong className="text-grey-00 font-semibold">{`Score: ${point.data.xFormatted}`}</strong>
                  </div>
                  <div className="text-s text-grey-60">{`${point.data.yFormatted}`}</div>
                </div>
              )}
              colors={['#6D28D9']}
              markers={[
                ...(thresholds.review != null
                  ? [
                      {
                        axis: 'x' as const,
                        value: thresholds.review,
                        lineStyle: { stroke: '#A3A3A3', strokeWidth: 1, strokeDasharray: '4 4' },
                        legend: `review ≥ ${thresholds.review}`,
                      },
                    ]
                  : []),
                ...(thresholds.blockAndReview != null
                  ? [
                      {
                        axis: 'x' as const,
                        value: thresholds.blockAndReview,
                        lineStyle: { stroke: '#FB923C', strokeWidth: 1, strokeDasharray: '4 4' },
                        legend: `block & review ≥ ${thresholds.blockAndReview}`,
                      },
                    ]
                  : []),
                ...(thresholds.decline != null
                  ? [
                      {
                        axis: 'x' as const,
                        value: thresholds.decline,
                        lineStyle: { stroke: '#EF4444', strokeWidth: 1, strokeDasharray: '4 4' },
                        legend: `decline ≥ ${thresholds.decline}`,
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
