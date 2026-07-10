import { Callout } from '@app-builder/components/Callout';
import GridTable from '@app-builder/components/GridTable';
import { Panel } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import type {
  ContinuousScreeningDatasetUpdateCompletion,
  ContinuousScreeningDatasetUpdateSummary,
} from '@app-builder/models/continuous-screening';
import { useContinuousScreeningDatasetUpdatesInfiniteQuery } from '@app-builder/queries/continuous-screening/dataset-updates';
import { formatNumber } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Card, DefaultTooltip, Typo, useFormatLanguage } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { LIMLIT_FOR_PANELS, TagStatus, useDateAtFormat } from './utils';

export function DatasetUpdate({ data }: { data: ContinuousScreeningDatasetUpdateSummary[] }) {
  const { t } = useTranslation(['continuousScreening']);
  return (
    <Card className="p-md grid gap-sm">
      <header className="flex justify-between items-center">
        <div className="flex gap-xs">
          <Typo variant="title2">{t('continuousScreening:observability.dataset_updates')}</Typo>
          <DefaultTooltip content={t('continuousScreening:observability.dataset_updates_tooltip')}>
            <Icon icon="tip" className="size-4" />
          </DefaultTooltip>
        </div>
        <PanelDatasetUpdate />
      </header>
      <Callout color="purple">{t('continuousScreening:observability.dataset_updates_callout')}</Callout>
      <DatasetUpdatContent data={data} />
    </Card>
  );
}

function PanelDatasetUpdate() {
  return (
    <Panel.Root>
      <Panel.Trigger>
        <Icon icon="eye" className="size-4" />
      </Panel.Trigger>
      <Panel.Container size="medium">
        <PanelDatasetUpdateContent />
      </Panel.Container>
    </Panel.Root>
  );
}

function PanelDatasetUpdateContent() {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const locale = useFormatLanguage();
  const query = useContinuousScreeningDatasetUpdatesInfiniteQuery(LIMLIT_FOR_PANELS);
  const { dateFormatter } = useDateAtFormat();

  return (
    <Panel.Content>
      <Panel.Header>
        <Typo variant="title2">{t('continuousScreening:observability.dataset_updates')}</Typo>
      </Panel.Header>
      {match(query)
        .with({ isPending: true }, () => (
          <div className="flex items-center justify-center p-md">
            <Spinner />
          </div>
        ))
        .with({ isError: true }, () => (
          <div className="text-grey-secondary p-md text-center text-xs">{t('common:global_error')}</div>
        ))
        .otherwise((query) => {
          const updates = query.data.pages.flatMap((page) => page.items);

          return (
            <div className="flex flex-col gap-md text-sm">
              <GridTable.Table className="grid-cols-[repeat(5,auto)]">
                <GridTable.Row className="font-semibold border-b border-grey-border">
                  <GridTable.Cell>{t('continuousScreening:observability.dataset_updates_date')}</GridTable.Cell>
                  <GridTable.Cell>{t('continuousScreening:observability.dataset_updates_title')}</GridTable.Cell>
                  <GridTable.Cell>{t('continuousScreening:observability.dataset_updates_version')}</GridTable.Cell>
                  <GridTable.Cell>
                    {t('continuousScreening:observability.dataset_updates_number_of_items')}
                  </GridTable.Cell>
                  <GridTable.Cell>{t('continuousScreening:observability.dataset_updates_status')}</GridTable.Cell>
                </GridTable.Row>
                {updates.map((item) => (
                  <GridTable.Row key={item.id}>
                    <GridTable.Cell>{dateFormatter(item.createdAt)}</GridTable.Cell>
                    <GridTable.Cell className="truncate">{item.title || item.datasetName}</GridTable.Cell>
                    <GridTable.Cell className="gap-sm">v.{item.version}</GridTable.Cell>
                    <GridTable.Cell className="justify-end tabular-nums">
                      {formatNumber(item.totalItems, { language: locale })}
                    </GridTable.Cell>
                    <GridTable.Cell>
                      <DatasetUpdateStatus item={item} />
                    </GridTable.Cell>
                  </GridTable.Row>
                ))}
              </GridTable.Table>
            </div>
          );
        })}
      {query.hasNextPage ? (
        <Panel.Footer>
          <Panel.FooterButton label={t('common:close')} isCloseButton />
          <Panel.FooterButton
            label={t('common:load_more_results')}
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
          />
        </Panel.Footer>
      ) : null}
    </Panel.Content>
  );
}

function DatasetUpdateStatus({ item }: { item: ContinuousScreeningDatasetUpdateSummary }) {
  const { t } = useTranslation(['continuousScreening']);

  return (
    <div className="flex flex-col items-start gap-2xs">
      <TagStatus status={item.status}>
        {t(`continuousScreening:observability.grid_versions_status_${item.status}`)}
      </TagStatus>
      {item.status !== 'completed' ? <DatasetUpdateCompletionDetails completion={item.completion} /> : null}
    </div>
  );
}

function DatasetUpdateCompletionDetails({ completion }: { completion: ContinuousScreeningDatasetUpdateCompletion }) {
  const { t } = useTranslation(['continuousScreening']);
  const locale = useFormatLanguage();
  const details = getDatasetUpdateCompletionDetails(completion);
  if (details.length === 0) return null;

  return (
    <div className="text-grey-secondary flex flex-wrap gap-x-xs gap-y-2xs text-xs">
      {details.map(({ status, value }) => (
        <span key={status}>
          {t(`continuousScreening:observability.dataset_updates_completion_${status}`, {
            percentage: formatNumber(value, { language: locale }),
          })}
        </span>
      ))}
    </div>
  );
}

function getDatasetUpdateCompletionDetails(completion: ContinuousScreeningDatasetUpdateCompletion) {
  return (['completed', 'processing', 'pending', 'failed'] as const)
    .map((status) => ({
      status,
      value: getDatasetUpdateCompletionPercentage(completion[status], completion.total),
      count: completion[status],
    }))
    .filter(({ count }) => count > 0);
}

function getDatasetUpdateCompletionPercentage(count: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((count / total) * 100);
}

type DatasetUpdateContentProps = {
  data: ContinuousScreeningDatasetUpdateSummary[];
};

function DatasetUpdatContent({ data }: DatasetUpdateContentProps) {
  const { dateFormatter } = useDateAtFormat();

  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-md gap-y-sm items-center">
      {data.map((item) => {
        const formattedDate = dateFormatter(item.createdAt);

        return (
          <div key={item.id} className="grid col-span-full grid-cols-subgrid items-center">
            <time dateTime={item.createdAt} className="text-grey-secondary">
              {formattedDate}
            </time>
            <div className="flex min-w-0 items-center gap-sm">
              <span className="truncate">{item.title || item.datasetName}</span>
              <TagStatus status={item.status ?? 'completed'}>v.{item.version}</TagStatus>
              <DatasetUpdateCompletionDetails completion={item.completion} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
