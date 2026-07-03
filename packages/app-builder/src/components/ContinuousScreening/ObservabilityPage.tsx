import { Page } from '@app-builder/components/Page';
import { ScreeningNavigationTabs } from '@app-builder/components/Screenings/Navigation/Tabs';
import { type ContinuousScreeningDatasetUpdateSummary } from '@app-builder/models/continuous-screening';
import { useContinuousScreeningDatasetUpdatesInfiniteQuery } from '@app-builder/queries/continuous-screening/dataset-updates';
import { formatDateAtTime } from '@app-builder/utils/datetime';
import { useFormatLanguage, useFormatTimezone } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Card, cn, DefaultTooltip, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { Callout } from '../Callout';
import GridTable from '../GridTable';
import { pageLayoutGutter } from '../Page/page-layout';
import { Panel } from '../Panel';
import { Spinner } from '../Spinner';

type ObservabilityPageProps = {
  datasetUpdates: ContinuousScreeningDatasetUpdateSummary[];
};

export function ObservabilityPage({ datasetUpdates }: ObservabilityPageProps) {
  return (
    <Page.Main>
      <Page.Content>
        <div className={cn('flex flex-col', pageLayoutGutter.gap)}>
          <ScreeningNavigationTabs />
          <div className={cn('grid lg:grid-cols-2', pageLayoutGutter.gap)}>
            <Card className="p-md grid gap-sm ">
              <header className="flex justify-between items-center">
                <div className="flex gap-xs">
                  <Typo variant="title2">Client data indexing</Typo>
                  <DefaultTooltip content="Client data indexing is the process of indexing client data into the database.">
                    <Icon icon="tip" className="size-4" />
                  </DefaultTooltip>
                </div>
                <div className="flex gap-sm items-center">
                  <Tag color="yellow">Pending: +1000</Tag>
                  <PanelCientIndexing />
                </div>
              </header>
              <Callout color="purple">Your data indexing in Marble.</Callout>
              <ClientDataIndexing
                data={[
                  { indexingDate: '2026-07-03T12:00:00Z', indexingValue: 2130, indexingStatus: 'pending' },
                  { indexingDate: '2026-07-02T12:00:00Z', indexingValue: 1230, indexingStatus: 'completed' },
                  { indexingDate: '2026-07-01T12:00:00Z', indexingValue: 4322, indexingStatus: 'failed' },
                ]}
              />
            </Card>
            <Card className="p-md grid gap-sm ">
              <header className="flex justify-between items-center">
                <div className="flex gap-xs">
                  <Typo variant="title2">Dataset updates</Typo>
                  <DefaultTooltip content="Dataset updates are the process of updating the dataset with new data.">
                    <Icon icon="tip" className="size-4" />
                  </DefaultTooltip>
                </div>
                <PanelDatasetUpdate />
              </header>
              <Callout color="purple">Datasets from provider and their status in Marble.</Callout>
              <DatasetUpdate data={datasetUpdates} />
            </Card>
            <GridVersions
              data={[
                {
                  version: '0230240055',
                  receptionTime: '2026-07-03T12:00:00Z',
                  jobsStart: '2026-07-03T12:00:00Z',
                  jobsEnd: '2026-07-03T12:00:00Z',
                  configurationName: 'Configuration 1',
                  status: 'inProgress',
                  progressValue: 50,
                },
                {
                  version: '0230240054',
                  receptionTime: '2026-07-02T12:00:00Z',
                  jobsStart: '2026-07-02T12:00:00Z',
                  jobsEnd: '2026-07-02T12:00:00Z',
                  configurationName: 'Configuration 2',
                  status: 'completed',
                  progressValue: 100,
                },
                {
                  version: '0230240053',
                  receptionTime: '2026-07-01T12:00:00Z',
                  jobsStart: '2026-07-01T12:00:00Z',
                  jobsEnd: '2026-07-01T12:00:00Z',
                  configurationName: 'Configuration 3',
                  status: 'failed',
                  progressValue: 0,
                },
              ]}
            />
          </div>
        </div>
      </Page.Content>
    </Page.Main>
  );
}

type GridVersionsProps = {
  data: {
    version: string;
    receptionTime: string;
    jobsStart: string;
    jobsEnd: string;
    configurationName: string;
    status: 'inProgress' | 'completed' | 'failed';
    progressValue: number;
  }[];
};

function GridVersions({ data }: GridVersionsProps) {
  const locale = useFormatLanguage();
  const timezone = useFormatTimezone();

  return (
    <div className="col-span-2 flex flex-col gap-sm">
      <Callout color="purple" className="bg-surface-card w-fit" bordered>
        Versions of dataset in Marble.
      </Callout>
      <GridTable.Table className="grid-cols-6">
        <GridTable.Row className="font-semibold border-b border-grey-border">
          <GridTable.Cell>Dataset version</GridTable.Cell>
          <GridTable.Cell>Reception time</GridTable.Cell>
          <GridTable.Cell>Jobs’ start</GridTable.Cell>
          <GridTable.Cell>Jobs’ end</GridTable.Cell>
          <GridTable.Cell>Name of configuration</GridTable.Cell>
          <GridTable.Cell>Status</GridTable.Cell>
        </GridTable.Row>
        {data.map((item) => (
          <GridTable.Row key={item.version}>
            <GridTable.Cell>{item.version}</GridTable.Cell>
            <GridTable.Cell>{formatDateAtTime(item.receptionTime, { locale, timeZone: timezone })}</GridTable.Cell>
            <GridTable.Cell>{formatDateAtTime(item.jobsStart, { locale, timeZone: timezone })}</GridTable.Cell>
            <GridTable.Cell>{formatDateAtTime(item.jobsEnd, { locale, timeZone: timezone })}</GridTable.Cell>
            <GridTable.Cell>{item.configurationName}</GridTable.Cell>
            <GridTable.Cell>
              <GridStatus status={item.status} progressValue={item.progressValue} />
            </GridTable.Cell>
          </GridTable.Row>
        ))}
      </GridTable.Table>
    </div>
  );
}

function GridStatus({
  status,
  progressValue,
}: {
  status: GridVersionsProps['data'][number]['status'];
  progressValue: number;
}) {
  if (status === 'completed') return <Tag color="green">Completed</Tag>;
  if (status === 'failed') return <Tag color="red">Failed</Tag>;
  return <Tag color="yellow">{`In progress - ${progressValue}%`}</Tag>;
}

type ClientDataIndexingProps = {
  data: {
    indexingDate: string;
    indexingValue: number;
    indexingStatus: 'pending' | 'completed' | 'failed';
  }[];
};

function ClientDataIndexing({ data }: ClientDataIndexingProps) {
  const { t } = useTranslation(['continuousScreening']);
  const locale = useFormatLanguage();
  const timezone = useFormatTimezone();

  return (
    <div className="grid grid-cols-2 gap-md w-fit">
      {data.map((item) => {
        const formattedDate = formatDateAtTime(item.indexingDate, {
          locale,
          timeZone: timezone,
          todayLabel: t('continuousScreening:observability.today'),
          yesterdayLabel: t('continuousScreening:observability.yesterday'),
          atSeparator: t('continuousScreening:observability.date_time_separator'),
        });

        return (
          <div key={item.indexingDate} className="grid col-span-full grid-cols-subgrid items-center">
            <time dateTime={item.indexingDate} className="text-grey-secondary">
              {formattedDate}
            </time>
            <Tag
              color={
                item.indexingStatus === 'pending' ? 'yellow' : item.indexingStatus === 'completed' ? 'green' : 'red'
              }
              className="gap-sm"
            >
              <Icon
                icon={
                  item.indexingStatus === 'pending'
                    ? 'waiting_for_action'
                    : item.indexingStatus === 'completed'
                      ? 'checked'
                      : 'x'
                }
                className="size-4"
              />
              {item.indexingValue}
            </Tag>
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
    <div className="grid grid-cols-2 gap-md w-fit">
      {data.map((item) => {
        const formattedDate = formatDateAtTime(item.createdAt, {
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
            <Tag color="green" className="gap-sm">
              <Icon icon="checked" className="size-4" />
              v.{item.version}
            </Tag>
          </div>
        );
      })}
    </div>
  );
}

function PanelCientIndexing() {
  return (
    <Panel.Root>
      <Panel.Trigger>
        <Icon icon="eye" className="size-4" />
      </Panel.Trigger>
      <Panel.Container size="small">
        <Panel.Content>
          <Panel.Header>
            <Typo variant="title2">Client data indexing</Typo>
          </Panel.Header>
          <Panel.Footer>
            <Panel.FooterButton label="Close" isCloseButton />
          </Panel.Footer>
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
}

function PanelDatasetUpdate() {
  const { t } = useTranslation(['common']);
  const locale = useFormatLanguage();
  const timezone = useFormatTimezone();
  const query = useContinuousScreeningDatasetUpdatesInfiniteQuery();

  return (
    <Panel.Root>
      <Panel.Trigger>
        <Icon icon="eye" className="size-4" />
      </Panel.Trigger>
      <Panel.Container size="medium">
        <Panel.Content>
          <Panel.Header>
            <Typo variant="title2">Dataset updates</Typo>
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
              const updates = query.data.pages.flatMap((page) => page);

              return (
                <div className="flex flex-col gap-md">
                  <GridTable.Table className="grid-cols-3">
                    <GridTable.Row className="font-semibold border-b border-grey-border">
                      <GridTable.Cell>Date</GridTable.Cell>
                      <GridTable.Cell>Version</GridTable.Cell>
                      <GridTable.Cell>Number of items</GridTable.Cell>
                    </GridTable.Row>
                    {updates.map((item) => (
                      <GridTable.Row key={item.id}>
                        <GridTable.Cell>
                          {formatDateAtTime(item.createdAt, { locale, timeZone: timezone })}
                        </GridTable.Cell>
                        <GridTable.Cell>v.{item.version}</GridTable.Cell>
                        <GridTable.Cell>{item.totalItems}</GridTable.Cell>
                      </GridTable.Row>
                    ))}
                  </GridTable.Table>
                </div>
              );
            })}
          {query.hasNextPage ? (
            <Panel.Footer>
              <Panel.FooterButton label="Close" isCloseButton />
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
