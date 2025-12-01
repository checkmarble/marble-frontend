import { Spinner } from '@app-builder/components/Spinner';
import { CaseStatusByDateResponse } from '@app-builder/models/analytics/cases-status-by-date';
import { useCaseStatusByDate } from '@app-builder/queries/cases/case-status-by-date';
import { useFormatLanguage } from '@app-builder/utils/format';
import { ResponsiveBar } from '@nivo/bar';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2 } from 'ui-design-system';
import { CaseStatusBadge } from '../../CaseStatus';
import { getYAxisTicksValues, graphCaseStatuses, graphStatusesColors } from '../constants';

export const CaseByDateGraph = () => {
  const { t } = useTranslation(['cases', 'common']);
  const caseStatusByDateQuery = useCaseStatusByDate();
  const language = useFormatLanguage();
  const [hovering, setHovering] = useState<string | null>(null);

  return (
    <div className="h-100 bg-grey-background-light rounded-v2-lg p-v2-md flex flex-col gap-v2-sm">
      <span className="font-medium text-s">{t('cases:overview.graph.cases_by_status.title')}</span>
      <div className="border border-grey-border rounded-v2-lg p-v2-sm bg-white h-full flex flex-col gap-v2-xs">
        {match(caseStatusByDateQuery)
          .with({ isPending: true }, () => (
            <div className="grid place-items-center h-full">
              <Spinner className="size-12" />
            </div>
          ))
          .with({ isError: true }, () => (
            <div className="grid place-items-center h-full">
              <div className="flex flex-col items-center gap-v2-sm">
                <span className="text-s text-grey-60 text-center">{t('common:generic_fetch_data_error')}</span>
                <ButtonV2 variant="secondary" onClick={() => caseStatusByDateQuery.refetch()}>
                  {t('common:retry')}
                </ButtonV2>
              </div>
            </div>
          ))
          .with({ isSuccess: true }, (query) => {
            if (!query.data) return null;

            const yAxisTicksValues = getYAxisTicksValues(query.data);
            const maxValue = yAxisTicksValues[yAxisTicksValues.length - 1];

            return (
              <>
                <span className="text-xs text-grey-60">{t('cases:overview.graph.count')}</span>
                <div className="flex-1">
                  <ResponsiveBar<CaseStatusByDateResponse>
                    enableLabel={false}
                    data={query.data}
                    keys={graphCaseStatuses}
                    indexBy="date"
                    valueScale={{ type: 'linear', min: 0, max: maxValue }}
                    gridYValues={yAxisTicksValues}
                    axisLeft={{
                      legend: t('cases:overview.graph.count'),
                      legendOffset: -70,
                      tickValues: yAxisTicksValues,
                      format: (value: number) => {
                        return Intl.NumberFormat(language, { notation: 'compact' }).format(value);
                      },
                    }}
                    axisBottom={{
                      tickValues: query.data
                        .filter((_, i, arr) => i === 0 || i === arr.length - 1 || i === Math.ceil(arr.length / 2))
                        .map((d) => d.date),
                      format: (value: string) => {
                        const date = new Date(value);
                        return date.toLocaleDateString(language, {
                          month: 'short',
                          day: 'numeric',
                        });
                      },
                    }}
                    margin={{ top: 5, right: 5, bottom: 54, left: 50 }}
                    defs={[
                      {
                        id: 'unhoverOpacity',
                        type: 'linearGradient',
                        colors: [
                          { offset: 0, color: 'inherit', opacity: 0.75 },
                          { offset: 100, color: 'inherit', opacity: 0.75 },
                        ],
                      },
                    ]}
                    fill={[
                      {
                        match: (n) => hovering !== null && n.data.indexValue !== hovering,
                        id: 'unhoverOpacity',
                      },
                    ]}
                    colors={Object.values(graphStatusesColors)}
                    padding={0.3}
                    layout="vertical"
                    onMouseEnter={(d) => setHovering(d.indexValue as string)}
                    onMouseLeave={() => setHovering(null)}
                    legends={[
                      {
                        dataFrom: 'keys',
                        anchor: 'bottom',
                        direction: 'row',
                        itemWidth: 100,
                        itemHeight: 25,
                        translateY: 54,
                      },
                    ]}
                    tooltip={({ id, value, data }) => (
                      <div className="flex flex-col gap-v2-sm w-auto max-w-max bg-white p-v2-sm rounded-lg border border-grey-90 shadow-sm whitespace-nowrap">
                        <div className="text-s text-grey-60">{data.date}</div>
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
                    theme={{
                      grid: { line: { stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '4 4' } },
                    }}
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
