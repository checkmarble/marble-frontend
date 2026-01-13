import { DataListGrid } from '@app-builder/components/DataModelExplorer/DataListGrid';
import { FormatData } from '@app-builder/components/FormatData';
import { Spinner } from '@app-builder/components/Spinner';
import { SquareTag } from '@app-builder/components/SquareTag';
import { ContinuousScreeningRequest } from '@app-builder/models/continuous-screening';
import { useContinuousScreeningConfigurationQuery } from '@app-builder/queries/continuous-screening/configuration';
import { parseUnknownData } from '@app-builder/utils/parse';
import { HoverCard, HoverCardContent, HoverCardPortal, HoverCardTrigger } from '@radix-ui/react-hover-card';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { match } from 'ts-pattern';

type ScreeningRequestDetailProps = {
  configStableId: string;
  request: ContinuousScreeningRequest;
};

export const ScreeningRequestDetail = ({ configStableId, request }: ScreeningRequestDetailProps) => {
  const { t } = useTranslation(['common', 'continuousScreening', 'screenings']);
  const configQuery = useContinuousScreeningConfigurationQuery(configStableId);
  const queries = R.entries(request.searchInput.queries).map(([key, value]) => value);
  if (!queries[0]) return null;

  const queryEntries = R.pipe(
    queries[0].properties,
    R.mapValues((property) => parseUnknownData(property[0])),
    R.entries(),
  );

  return (
    <div className="flex flex-col gap-v2-lg p-v2-md bg-surface-card rounded-v2-lg border border-grey-border">
      <div className="flex flex-col gap-v2-sm">
        <div className="font-medium">{t('continuousScreening:review.request_detail_subtitle')}</div>
        <DataListGrid>
          <div className="text-grey-placeholder truncate leading-6">
            {t('continuousScreening:review.entity_type_label')}
          </div>
          <div>
            <SquareTag className="">{queries[0]?.schema}</SquareTag>
          </div>
          {queryEntries.map(([key, value]) => (
            <Fragment key={key}>
              <div className="text-grey-secondary truncate">{t(`screenings:entity.property.${key}`)}</div>
              <FormatData data={value} className="truncate" />
            </Fragment>
          ))}
        </DataListGrid>
      </div>
      <div className="flex flex-col gap-v2-sm">
        <div className="font-medium">{t('continuousScreening:review.search_parameters_subtitle')}</div>
        {match(configQuery)
          .with({ isPending: true }, () => {
            return <Spinner className="size-6" />;
          })
          .with({ isError: true }, () => {
            return <div>{t('common:generic_fetch_data_error')}</div>;
          })
          .with({ isSuccess: true }, (query) => {
            if (!query.data) return null;

            const displayedDatasets = query.data.datasets.slice(0, 3);
            const restCount = query.data.datasets.length - displayedDatasets.length;

            return (
              <DataListGrid>
                <div className="text-grey-secondary truncate leading-6 capitalize">
                  {t('screenings:dataset', { count: query.data.datasets.length })}
                </div>
                <div className="truncate flex flex-row flex-wrap gap-v2-sm">
                  {displayedDatasets.map((dataset) => (
                    <SquareTag key={dataset}>{dataset}</SquareTag>
                  ))}
                  {restCount > 0 ? (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div>
                          <SquareTag>+{restCount}</SquareTag>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardPortal>
                        <HoverCardContent side="left" sideOffset={4}>
                          <div className="bg-surface-card p-v2-md flex flex-wrap gap-v2-sm max-w-200 border border-grey-border rounded-v2-sm">
                            {query.data.datasets.slice(3).map((dataset) => (
                              <SquareTag key={dataset}>{dataset}</SquareTag>
                            ))}
                          </div>
                        </HoverCardContent>
                      </HoverCardPortal>
                    </HoverCard>
                  ) : null}
                </div>
                <div className="text-grey-secondary truncate leading-6">{t('screenings:match_threshold')}</div>
                <div className="truncate">
                  <SquareTag>{query.data.matchThreshold}</SquareTag>
                </div>
              </DataListGrid>
            );
          })
          .exhaustive()}
      </div>
    </div>
  );
};
