import { Page } from '@app-builder/components/Page';
import { ScreeningNavigationTabs } from '@app-builder/components/Screenings/Navigation/Tabs';
import {
  type ContinuousScreeningClientDataIndexing,
  type ContinuousScreeningDatasetUpdateSummary,
  type ContinuousScreeningJobError,
  type ContinuousScreeningUpdateJobSummary,
} from '@app-builder/models/continuous-screening';
import {
  CLIENT_DATA_INDEXING_PAGE_SIZE,
  useContinuousScreeningClientDataIndexingInfiniteQuery,
  useContinuousScreeningClientDataIndexingQuery,
} from '@app-builder/queries/continuous-screening/client-data-indexing';
import { useContinuousScreeningDatasetUpdatesInfiniteQuery } from '@app-builder/queries/continuous-screening/dataset-updates';
import {
  UPDATE_JOBS_PAGE_SIZE,
  useContinuousScreeningUpdateJobsInfiniteQuery,
  useContinuousScreeningUpdateJobsQuery,
} from '@app-builder/queries/continuous-screening/update-jobs';
import { formatDateAtTime, formatOptionalDateAtTime, formatOptionalDuration } from '@app-builder/utils/datetime';
import { formatNumber, useFormatLanguage, useFormatTimezone } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Card, cn, DefaultTooltip, Tag, Tooltip, Typo } from 'ui-design-system';
import { Icon, IconName } from 'ui-icons';
import { Callout } from '../Callout';
import GridTable from '../GridTable';
import { pageLayoutGutter } from '../Page/page-layout';
import { Panel } from '../Panel';
import { Spinner } from '../Spinner';

const LIMLIT_FOR_PANELS = 20;

type ObservabilityPageProps = {
  datasetUpdates: ContinuousScreeningDatasetUpdateSummary[];
  updateJobs: ContinuousScreeningUpdateJobSummary[];
  clientDataIndexing: ContinuousScreeningClientDataIndexing[];
};

const UPDATE_JOBS_REFETCH_INTERVAL = 5000;

function isPendingIndexing(item: ContinuousScreeningClientDataIndexing) {
  return item.status !== 'completed' && item.status !== 'failed';
}

export function ObservabilityPage({ datasetUpdates, updateJobs, clientDataIndexing }: ObservabilityPageProps) {
  const { t } = useTranslation(['continuousScreening']);

  const updateJobsQuery = useContinuousScreeningUpdateJobsQuery(
    { limit: UPDATE_JOBS_PAGE_SIZE },
    { refetchInterval: UPDATE_JOBS_REFETCH_INTERVAL, initialData: updateJobs },
  );

  const clientDataIndexingQuery = useContinuousScreeningClientDataIndexingQuery(
    { limit: CLIENT_DATA_INDEXING_PAGE_SIZE },
    { refetchInterval: UPDATE_JOBS_REFETCH_INTERVAL, initialData: clientDataIndexing },
  );

  const clientDataIndexingData = clientDataIndexingQuery.data ?? clientDataIndexing;
  const clientDataIndexingPendingCount = clientDataIndexingData
    .filter(isPendingIndexing)
    .reduce((acc, item) => acc + (item.totalItems - (item.itemsProcessed ?? 0)), 0);

  return (
    <Page.Main>
      <Page.Content>
        <div className={cn('flex flex-col', pageLayoutGutter.gap)}>
          <ScreeningNavigationTabs />
          <div className={cn('grid grid-cols-1 lg:grid-cols-2', pageLayoutGutter.gap)}>
            <Card className="p-md grid gap-sm items-start mb-auto">
              <header className="flex justify-between items-center">
                <div className="flex gap-xs">
                  <Typo variant="title2">{t('continuousScreening:observability.client_data_indexing')}</Typo>
                  <DefaultTooltip content={t('continuousScreening:observability.client_data_indexing_tooltip')}>
                    <Icon icon="tip" className="size-4" />
                  </DefaultTooltip>
                </div>
                <div className="flex gap-sm items-center">
                  {clientDataIndexingPendingCount > 0 ? (
                    <Tag color="yellow">
                      <Icon icon={getIcon('pending')} className="size-4" />
                      {t('continuousScreening:observability.client_data_indexing_pending', {
                        count: clientDataIndexingPendingCount,
                      })}
                    </Tag>
                  ) : null}
                  <PanelCientIndexing />
                </div>
              </header>
              <Callout color="purple">{t('continuousScreening:observability.client_data_indexing_callout')}</Callout>
              <ClientDataIndexing data={clientDataIndexingData} />
            </Card>
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
              <DatasetUpdate data={datasetUpdates} />
            </Card>
            <GridVersions data={updateJobsQuery.data ?? updateJobs} />
          </div>
        </div>
      </Page.Content>
    </Page.Main>
  );
}

type GridVersionsProps = {
  data: ContinuousScreeningUpdateJobSummary[];
};

function GridVersions({ data }: GridVersionsProps) {
  const locale = useFormatLanguage();
  const timezone = useFormatTimezone();
  const { t } = useTranslation(['continuousScreening']);

  return (
    <div className="col-span-full flex flex-col gap-sm">
      <Callout color="purple" className="bg-surface-card w-fit" bordered>
        <span>{t('continuousScreening:observability.grid_versions_callout')}</span>
      </Callout>
      <GridTable.Table className="grid-cols-6">
        <GridTable.Row className="font-semibold border-b border-grey-border">
          <GridTable.Cell>{t('continuousScreening:observability.grid_versions_dataset_version')}</GridTable.Cell>
          <GridTable.Cell>{t('continuousScreening:observability.grid_versions_reception_time')}</GridTable.Cell>
          <GridTable.Cell className="hidden lg:block">
            {t('continuousScreening:observability.grid_versions_jobs_start')}
          </GridTable.Cell>
          <GridTable.Cell className="hidden lg:block">
            {t('continuousScreening:observability.grid_versions_jobs_end')}
          </GridTable.Cell>
          <GridTable.Cell>{t('continuousScreening:observability.grid_versions_name_of_configuration')}</GridTable.Cell>
          <GridTable.Cell className="flex items-center justify-between">
            {t('continuousScreening:observability.grid_versions_status')}
            <PanelDatasetUpdates />
          </GridTable.Cell>
        </GridTable.Row>
        {data.map((item) => (
          <GridTable.Row key={item.id}>
            <GridTable.Cell>{item.version}</GridTable.Cell>
            <GridTable.Cell>
              {formatOptionalDateAtTime(item.receptionTime, {
                todayLabel: t('continuousScreening:observability.today'),
                yesterdayLabel: t('continuousScreening:observability.yesterday'),
                atSeparator: t('continuousScreening:observability.date_time_separator'),
                locale,
                timeZone: timezone,
              })}
            </GridTable.Cell>
            <GridTable.Cell className="hidden lg:block">
              {formatOptionalDateAtTime(item.jobStart, {
                todayLabel: t('continuousScreening:observability.today'),
                yesterdayLabel: t('continuousScreening:observability.yesterday'),
                atSeparator: t('continuousScreening:observability.date_time_separator'),
                locale,
                timeZone: timezone,
              })}
            </GridTable.Cell>
            <GridTable.Cell className="hidden lg:block">
              {formatOptionalDateAtTime(item.jobEnd, {
                todayLabel: t('continuousScreening:observability.today'),
                yesterdayLabel: t('continuousScreening:observability.yesterday'),
                atSeparator: t('continuousScreening:observability.date_time_separator'),
                locale,
                timeZone: timezone,
              })}
            </GridTable.Cell>
            <GridTable.Cell>{item.configName}</GridTable.Cell>
            <GridTable.Cell>
              <GridStatus status={item.status} progressValue={getProgressValue(item)} errors={item.errors} />
            </GridTable.Cell>
          </GridTable.Row>
        ))}
      </GridTable.Table>
    </div>
  );
}

function getProgressValue({
  itemsProcessed,
  totalItems,
}: Pick<ContinuousScreeningUpdateJobSummary, 'itemsProcessed' | 'totalItems'>) {
  if (itemsProcessed === null || itemsProcessed === undefined || !totalItems || totalItems <= 0) return 0;
  return Math.round((itemsProcessed / totalItems) * 100);
}

function GridStatus({
  status,
  progressValue,
  errors,
}: {
  status: ContinuousScreeningUpdateJobSummary['status'];
  progressValue: number;
  errors: ContinuousScreeningJobError[];
}) {
  const { t } = useTranslation(['continuousScreening']);
  if (status === 'completed')
    return (
      <Tag color="green">
        <Icon icon={getIcon('completed')} className="size-4" />
        {t('continuousScreening:observability.grid_versions_status_completed')}
      </Tag>
    );
  if (status === 'failed') {
    return (
      <Tag color="red" className="gap-xs">
        <Icon icon={getIcon('failed')} className="size-4" />
        <span>{t('continuousScreening:observability.grid_versions_status_failed')}</span>
        {(errors ?? []).length > 0 ? (
          <Tooltip.Default
            content={
              <ul className="max-w-lg">
                {(errors ?? [])
                  .map((error) => error.details?.error)
                  .filter(Boolean)
                  .map((error) => (
                    <li key={error}>{error}</li>
                  ))}
              </ul>
            }
          >
            <Icon icon="tip" className="size-4" />
          </Tooltip.Default>
        ) : null}
      </Tag>
    );
  }
  if (status === 'pending')
    return (
      <Tag color="yellow">
        <Icon icon={getIcon('pending')} className="size-4" />
        {t('continuousScreening:observability.grid_versions_status_pending')}
      </Tag>
    );
  return (
    <Tag color="yellow">
      <Icon icon={getIcon('processing')} className="size-4" />
      {t('continuousScreening:observability.grid_versions_status_in_progress', { progressValue })}
    </Tag>
  );
}

type ClientDataIndexingProps = {
  data: ContinuousScreeningClientDataIndexing[];
};

function getIcon(status: ContinuousScreeningClientDataIndexing['status']): IconName {
  return match(status)
    .with('completed', () => 'tick')
    .with('failed', () => 'x')
    .with('processing', () => 'in-progress')
    .with('pending', () => 'schedule')
    .exhaustive() as IconName;
}

function ClientDataIndexing({ data }: ClientDataIndexingProps) {
  const { t } = useTranslation(['continuousScreening']);
  const locale = useFormatLanguage();
  const timezone = useFormatTimezone();

  const terminalItems = data.filter((item) => !isPendingIndexing(item)).slice(0, 5);

  return (
    <div className="grid grid-cols-[30%_auto_1fr] gap-md items-center">
      {terminalItems.map((item) => {
        const formattedDate = formatDateAtTime(item.jobStart, {
          locale,
          timeZone: timezone,
          todayLabel: t('continuousScreening:observability.today'),
          yesterdayLabel: t('continuousScreening:observability.yesterday'),
          atSeparator: t('continuousScreening:observability.date_time_separator'),
        });

        return (
          <div key={item.id} className="grid col-span-full grid-cols-subgrid items-center">
            <time dateTime={item.jobStart} className="text-grey-secondary">
              {formattedDate}
            </time>
            <Tag color={item.status === 'completed' ? 'green' : 'red'} className="gap-sm w-fit">
              <Icon icon={getIcon(item.status)} className="size-4" />
              {formatNumber(item.totalItems, { language: locale })}
            </Tag>
            <Tooltip.Default
              content={
                <ul className="max-w-lg">
                  {(item.errors ?? [])
                    .map((error) => error.details?.error)
                    .filter(Boolean)
                    .map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                </ul>
              }
            >
              <span className="line-clamp-1 cursor-pointer">
                {item.status === 'failed' && item.errors?.length > 0
                  ? item.errors.map((e) => e.details.error).join(', ')
                  : null}
              </span>
            </Tooltip.Default>
          </div>
        );
      })}
    </div>
  );
}

type DatasetUpdateProps = {
  data: ContinuousScreeningDatasetUpdateSummary[];
};

function DatasetUpdate({ data }: DatasetUpdateProps) {
  const { t } = useTranslation(['continuousScreening']);
  const locale = useFormatLanguage();
  const timezone = useFormatTimezone();

  return (
    <div className="grid grid-cols-3 gap-md w-fit">
      {data.map((item) => {
        const formattedDate = formatOptionalDateAtTime(item.createdAt, {
          locale,
          timeZone: timezone,
          todayLabel: t('continuousScreening:observability.today'),
          yesterdayLabel: t('continuousScreening:observability.yesterday'),
          atSeparator: t('continuousScreening:observability.date_time_separator'),
        });

        return (
          <div key={item.id} className="grid col-span-full grid-cols-subgrid items-center">
            <time dateTime={item.createdAt} className="text-grey-secondary">
              {formattedDate}
            </time>
            <Tag color="white" className="gap-sm" size="small">
              v.{item.version}
            </Tag>
            <span className="text-end tabular-nums">
              {t('continuousScreening:observability.items', {
                count: formatNumber(item.totalItems, { language: locale }),
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PanelCientIndexing() {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const locale = useFormatLanguage();
  const timezone = useFormatTimezone();
  const query = useContinuousScreeningClientDataIndexingInfiniteQuery(LIMLIT_FOR_PANELS);

  return (
    <Panel.Root>
      <Panel.Trigger>
        <Icon icon="eye" className="size-4" />
      </Panel.Trigger>
      <Panel.Container size="medium">
        <Panel.Content>
          <Panel.Header>
            <Typo variant="title2">{t('continuousScreening:observability.client_data_indexing')}</Typo>
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
              const items = query.data.pages.flatMap((page) => page.items);

              return (
                <div className="flex flex-col gap-md text-sm">
                  <GridTable.Table className="grid-cols-3">
                    <GridTable.Row className="font-semibold border-b border-grey-border">
                      <GridTable.Cell>{t('continuousScreening:observability.dataset_updates_date')}</GridTable.Cell>
                      <GridTable.Cell>
                        {t('continuousScreening:observability.grid_versions_items_ingested')}
                      </GridTable.Cell>
                      <GridTable.Cell>{t('continuousScreening:observability.grid_versions_status')}</GridTable.Cell>
                    </GridTable.Row>
                    {items.map((item) => (
                      <GridTable.Row key={item.id}>
                        <GridTable.Cell>
                          {formatOptionalDateAtTime(item.jobStart, {
                            todayLabel: t('continuousScreening:observability.today'),
                            yesterdayLabel: t('continuousScreening:observability.yesterday'),
                            atSeparator: t('continuousScreening:observability.date_time_separator'),
                            locale,
                            timeZone: timezone,
                          })}
                        </GridTable.Cell>
                        <GridTable.Cell className="justify-end tabular-nums">
                          {item.status === 'processing'
                            ? `${formatNumber(item.itemsProcessed ?? 0, { language: locale })} / ${formatNumber(
                                item.totalItems,
                                { language: locale },
                              )}`
                            : formatNumber(item.totalItems, { language: locale })}
                        </GridTable.Cell>
                        <GridTable.Cell>
                          <GridStatus
                            status={item.status}
                            progressValue={getProgressValue(item)}
                            errors={item.errors}
                          />
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
      </Panel.Container>
    </Panel.Root>
  );
}

function JobDurationCell({
  receptionTime,
  jobStart,
  jobEnd,
}: Pick<ContinuousScreeningUpdateJobSummary, 'receptionTime' | 'jobStart' | 'jobEnd'>) {
  const { t } = useTranslation(['continuousScreening']);
  const locale = useFormatLanguage();
  const timezone = useFormatTimezone();

  const receptionDate = formatOptionalDateAtTime(receptionTime, {
    locale,
    timeZone: timezone,
    todayLabel: t('continuousScreening:observability.today'),
    yesterdayLabel: t('continuousScreening:observability.yesterday'),
    atSeparator: t('continuousScreening:observability.date_time_separator'),
  });
  const duration = formatOptionalDuration(jobStart, jobEnd, { locale }, '');

  if (!duration) return <>{receptionDate}</>;

  return (
    <>{t('continuousScreening:observability.grid_versions_job_duration_summary', { date: receptionDate, duration })}</>
  );
}

function PanelDatasetUpdates() {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const locale = useFormatLanguage();
  const query = useContinuousScreeningUpdateJobsInfiniteQuery(LIMLIT_FOR_PANELS);

  return (
    <Panel.Root>
      <Panel.Trigger>
        <Icon icon="eye" className="size-4" />
      </Panel.Trigger>
      <Panel.Container size="large">
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
              const jobs = query.data.pages.flatMap((page) => page.items);

              return (
                <div className="flex flex-col gap-md text-sm">
                  <GridTable.Table className="grid-cols-5">
                    <GridTable.Row className="font-semibold border-b border-grey-border">
                      <GridTable.Cell>
                        {t('continuousScreening:observability.grid_versions_dataset_version')}
                      </GridTable.Cell>
                      <GridTable.Cell>
                        {t('continuousScreening:observability.grid_versions_job_duration')}
                      </GridTable.Cell>
                      <GridTable.Cell>
                        {t('continuousScreening:observability.grid_versions_name_of_configuration')}
                      </GridTable.Cell>
                      <GridTable.Cell>
                        {t('continuousScreening:observability.grid_versions_items_ingested')}
                      </GridTable.Cell>
                      <GridTable.Cell>{t('continuousScreening:observability.grid_versions_status')}</GridTable.Cell>
                    </GridTable.Row>
                    {jobs.map((item) => (
                      <GridTable.Row key={item.id}>
                        <GridTable.Cell>{item.version}</GridTable.Cell>
                        <GridTable.Cell>
                          <JobDurationCell
                            receptionTime={item.receptionTime}
                            jobStart={item.jobStart}
                            jobEnd={item.jobEnd}
                          />
                        </GridTable.Cell>
                        <GridTable.Cell>{item.configName}</GridTable.Cell>
                        <GridTable.Cell className="justify-end tabular-nums">
                          {item.status === 'processing'
                            ? `${formatNumber(item.itemsProcessed ?? 0, { language: locale })} / ${formatNumber(
                                item.totalItems,
                                { language: locale },
                              )}`
                            : formatNumber(item.totalItems, { language: locale })}
                        </GridTable.Cell>
                        <GridTable.Cell>
                          <GridStatus
                            status={item.status}
                            progressValue={getProgressValue(item)}
                            errors={item.errors}
                          />
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
      </Panel.Container>
    </Panel.Root>
  );
}

function PanelDatasetUpdate() {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const locale = useFormatLanguage();
  const timezone = useFormatTimezone();
  const query = useContinuousScreeningDatasetUpdatesInfiniteQuery(LIMLIT_FOR_PANELS);

  return (
    <Panel.Root>
      <Panel.Trigger>
        <Icon icon="eye" className="size-4" />
      </Panel.Trigger>
      <Panel.Container size="medium">
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
                  <GridTable.Table className="grid-cols-3">
                    <GridTable.Row className="font-semibold border-b border-grey-border">
                      <GridTable.Cell>{t('continuousScreening:observability.dataset_updates_date')}</GridTable.Cell>
                      <GridTable.Cell>{t('continuousScreening:observability.dataset_updates_version')}</GridTable.Cell>
                      <GridTable.Cell>
                        {t('continuousScreening:observability.dataset_updates_number_of_items')}
                      </GridTable.Cell>
                    </GridTable.Row>
                    {updates.map((item) => (
                      <GridTable.Row key={item.id}>
                        <GridTable.Cell>
                          {formatOptionalDateAtTime(item.createdAt, {
                            todayLabel: t('continuousScreening:observability.today'),
                            yesterdayLabel: t('continuousScreening:observability.yesterday'),
                            atSeparator: t('continuousScreening:observability.date_time_separator'),
                            locale,
                            timeZone: timezone,
                          })}
                        </GridTable.Cell>
                        <GridTable.Cell>v.{item.version}</GridTable.Cell>
                        <GridTable.Cell className="justify-end tabular-nums">
                          {formatNumber(item.totalItems, { language: locale })}
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
      </Panel.Container>
    </Panel.Root>
  );
}
