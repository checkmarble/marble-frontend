import { Spinner } from '@app-builder/components/Spinner';
import { CaseStatusByInboxResponse } from '@app-builder/models/analytics/case-status-by-inbox';
import { useCaseStatusByInbox } from '@app-builder/queries/cases/case-status-by-inbox';
import { useFormatLanguage } from '@app-builder/utils/format';
import { ResponsiveBar } from '@nivo/bar';
import { Fragment, useState } from 'react';
import { match } from 'ts-pattern';
import { CaseStatusBadge } from '../CaseStatus';
import { getYAxisTicksValues, graphCaseStatuses, graphStatusesColors } from './constants';

export const CaseByInboxGraph = () => {
  const caseStatusByInboxQuery = useCaseStatusByInbox();
  const language = useFormatLanguage();
  const [hovering, setHovering] = useState<string | null>(null);

  return (
    <div className="h-100 bg-grey-background-light rounded-v2-lg p-v2-md flex flex-col gap-v2-sm">
      <span className="font-medium text-s">Volume de cas créés par inbox</span>
      <div className="border border-grey-border rounded-v2-lg p-v2-sm bg-white h-full flex flex-col gap-v2-xs">
        {match(caseStatusByInboxQuery)
          .with({ isPending: true }, () => (
            <div className="grid place-items-center h-full">
              <Spinner className="size-12" />
            </div>
          ))
          .with({ isError: true }, () => <div>Error</div>)
          .with({ isSuccess: true }, (query) => {
            if (!query.data) return null;

            const yAxisTicksValues = getYAxisTicksValues(query.data);
            const maxValue = yAxisTicksValues[yAxisTicksValues.length - 1];

            return (
              <>
                <span className="text-xs text-grey-60">Count</span>
                <div className="flex-1">
                  <ResponsiveBar<CaseStatusByInboxResponse>
                    enableLabel={false}
                    data={query.data}
                    keys={graphCaseStatuses}
                    indexBy="inbox"
                    valueScale={{ type: 'linear', min: 0, max: maxValue }}
                    gridYValues={yAxisTicksValues}
                    axisLeft={{
                      legend: 'Count',
                      legendOffset: -70,
                      tickValues: yAxisTicksValues,
                      format: (value: number) => {
                        return Intl.NumberFormat(language, { notation: 'compact' }).format(value);
                      },
                    }}
                    axisBottom={{
                      tickRotation: -45,
                      truncateTickAt: 10,
                    }}
                    margin={{ top: 5, right: 5, bottom: 100, left: 50 }}
                    defs={[
                      {
                        id: 'unhoverOpacity',
                        type: 'linearGradient',
                        colors: [
                          { offset: 0, color: 'inherit', opacity: 0.5 },
                          { offset: 100, color: 'inherit', opacity: 0.5 },
                        ],
                      },
                    ]}
                    fill={[
                      {
                        match: (n) => hovering !== null && n.data.indexValue !== hovering,
                        id: 'unhoverOpacity',
                      },
                    ]}
                    colorBy="id"
                    colors={Object.values(graphStatusesColors)}
                    padding={0.3}
                    layout="vertical"
                    onMouseEnter={(d) => setHovering(d.indexValue as string)}
                    onMouseLeave={(d) => setHovering(null)}
                    legends={[
                      {
                        dataFrom: 'keys',
                        anchor: 'bottom',
                        direction: 'row',
                        itemWidth: 100,
                        itemHeight: 25,
                        translateY: 100,
                      },
                    ]}
                    tooltip={({ id, value, data }) => (
                      <div className="flex flex-col gap-v2-sm w-auto max-w-max bg-white p-v2-sm rounded-lg border border-grey-90 shadow-sm whitespace-nowrap">
                        <div className="text-s text-grey-60">{data.inbox}</div>
                        <div className="grid grid-cols-[calc(var(--spacing)_*_10)_1fr] gap-v2-xs">
                          {graphCaseStatuses.map((caseStatus) => (
                            <Fragment key={caseStatus}>
                              <div>{data[caseStatus]}</div>
                              <CaseStatusBadge status={caseStatus} />
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    )}
                  />
                </div>
              </>
            );
          })
          .exhaustive()}
      </div>
    </div>
  );
};
