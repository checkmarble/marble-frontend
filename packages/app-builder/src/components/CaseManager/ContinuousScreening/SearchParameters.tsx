import { DataListGrid } from '@app-builder/components/DataModelExplorer/DataListGrid';
import {
  buildCategoryDatasetSummaries,
  useDatasetTitle,
} from '@app-builder/components/ListAndTopicConfiguration/dataset-utils';
import { DatasetTag } from '@app-builder/components/Screenings/DatasetTag';
import { Spinner } from '@app-builder/components/Spinner';
import { SquareTag } from '@app-builder/components/SquareTag';
import { useContinuousScreeningConfigurationQuery } from '@app-builder/queries/continuous-screening/configuration';
import { useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import { useTranslation } from 'react-i18next';
import { match, P } from 'ts-pattern';
import { Card, ExpandableGroupTagLine } from 'ui-design-system';

type SearchParametersProps = {
  configStableId: string;
};

// Number of titles shown inside a single topic-group summary before collapsing to "+N".
const INNER_LIMIT = 2;

function GroupSummaryText({ titles }: { titles: string[] }) {
  const shown = titles.slice(0, INNER_LIMIT);
  const overflow = titles.length - shown.length;
  return (
    <span className="truncate">
      {shown.join(', ')}
      {overflow > 0 ? `, +${overflow}` : null}
    </span>
  );
}

export function SearchParameters({ configStableId }: SearchParametersProps) {
  const { t } = useTranslation(['common']);
  const { formatItemName } = useDatasetTitle();
  const configQuery = useContinuousScreeningConfigurationQuery(configStableId);
  const datasetsQuery = useListConfigQuery('continuous_monitoring');

  return (
    <Card className="flex flex-col gap-sm">
      <div className="font-medium">{t('continuousScreening:review.search_parameters_subtitle')}</div>
      {match([configQuery, datasetsQuery])
        .with([{ isError: true }, P.any], [P.any, { isError: true }], () => {
          return <div>{t('common:generic_fetch_data_error')}</div>;
        })
        .with([{ isPending: true }, P.any], [P.any, { isPending: true }], () => {
          return <Spinner className="size-6" />;
        })
        .with([{ isSuccess: true }, { isSuccess: true }], ([{ data: config }, { data: datasets }]) => {
          if (!config) return null;

          const summaries = buildCategoryDatasetSummaries(config.datasets, datasets.filters, formatItemName);

          return (
            <DataListGrid>
              <div className="text-grey-secondary truncate leading-6 capitalize">
                {t('screenings:dataset', { count: config.datasets.length })}
              </div>
              <div className="flex flex-col gap-sm min-w-0">
                {summaries.map(({ category, items }) => (
                  <div key={category}>
                    <ExpandableGroupTagLine
                      items={[
                        <DatasetTag key={`${category}-dataset`} category={category} />,
                        ...items.map((item, index) => (
                          <span key={item.id} className="text-small text-grey-primary flex items-center">
                            {index > 0 ? <span className="me-sm size-1.5 bg-grey-border rounded-full" /> : null}
                            <GroupSummaryText titles={item.titles} />
                          </span>
                        )),
                      ]}
                      moreButton={(overflow, onExpand) => (
                        <span
                          className="text-small text-grey-secondary flex cursor-pointer items-center"
                          onClick={onExpand}
                        >
                          <span className="me-sm size-1.5 bg-grey-border rounded-full" />+{overflow}
                        </span>
                      )}
                    />
                  </div>
                ))}
              </div>
              <div className="text-grey-secondary truncate leading-6">{t('screenings:match_threshold')}</div>
              <div className="truncate">
                <SquareTag>{config.matchThreshold}</SquareTag>
              </div>
            </DataListGrid>
          );
        })
        .exhaustive()}
    </Card>
  );
}
