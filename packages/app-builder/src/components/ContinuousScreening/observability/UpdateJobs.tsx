import { Callout } from '@app-builder/components/Callout';
import GridTable from '@app-builder/components/GridTable';
import { Panel } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { ContinuousScreeningUpdateJobSummary } from '@app-builder/models/continuous-screening';
import { useContinuousScreeningUpdateJobsInfiniteQuery } from '@app-builder/queries/continuous-screening/update-jobs';
import { formatOptionalDuration } from '@app-builder/utils/datetime';
import { formatNumber } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Tooltip, Typo, useFormatLanguage } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { GridStatus, getProgressValue, LIMIT_FOR_PANELS, useDateAtFormat } from './utils';

export function UpdateJobs({ data }: { data: ContinuousScreeningUpdateJobSummary[] }) {
  return <UpdateJobsContent data={data} />;
}

type UpdateJobsContentProps = {
  data: ContinuousScreeningUpdateJobSummary[];
};

function UpdateJobsContent({ data }: UpdateJobsContentProps) {
  const { t } = useTranslation(['continuousScreening']);
  const locale = useFormatLanguage();
  const { dateFormatter } = useDateAtFormat();
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
            {t('continuousScreening:observability.grid_versions_job_duration')}
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
            <GridTable.Cell>{dateFormatter(item.receptionTime)}</GridTable.Cell>
            <GridTable.Cell className="hidden lg:block">{dateFormatter(item.jobStart)}</GridTable.Cell>
            <GridTable.Cell className="hidden lg:block">
              <Tooltip.Default
                content={
                  <span className="flex gap-xs">
                    <span>{t('continuousScreening:observability.grid_versions_jobs_end')}</span>
                    <span>:</span>
                    <span>{dateFormatter(item.jobEnd)}</span>
                  </span>
                }
              >
                <span>{formatOptionalDuration(item.jobStart, item.jobEnd, { locale })}</span>
              </Tooltip.Default>
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

function JobDurationCell({
  receptionTime,
  jobStart,
  jobEnd,
}: Pick<ContinuousScreeningUpdateJobSummary, 'receptionTime' | 'jobStart' | 'jobEnd'>) {
  const { t } = useTranslation(['continuousScreening']);
  const locale = useFormatLanguage();
  const { dateFormatter } = useDateAtFormat();
  const duration = formatOptionalDuration(jobStart, jobEnd, { locale }, '');

  if (!duration) return <>{dateFormatter(receptionTime)}</>;

  return (
    <>
      {t('continuousScreening:observability.grid_versions_job_duration_summary', {
        date: dateFormatter(receptionTime),
        duration,
      })}
    </>
  );
}

function PanelDatasetUpdates() {
  return (
    <Panel.Root>
      <Panel.Trigger>
        <Icon icon="eye" className="size-4" />
      </Panel.Trigger>
      <Panel.Container size="large">
        <PanelDatasetUpdatesContent />
      </Panel.Container>
    </Panel.Root>
  );
}

function PanelDatasetUpdatesContent() {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const locale = useFormatLanguage();
  const query = useContinuousScreeningUpdateJobsInfiniteQuery(LIMIT_FOR_PANELS);

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
          const jobs = query.data.pages.flatMap((page) => page.items);

          return (
            <div className="flex flex-col gap-md text-sm">
              <GridTable.Table className="grid-cols-5">
                <GridTable.Row className="font-semibold border-b border-grey-border">
                  <GridTable.Cell>
                    {t('continuousScreening:observability.grid_versions_dataset_version')}
                  </GridTable.Cell>
                  <GridTable.Cell>{t('continuousScreening:observability.grid_versions_job_duration')}</GridTable.Cell>
                  <GridTable.Cell>
                    {t('continuousScreening:observability.grid_versions_name_of_configuration')}
                  </GridTable.Cell>
                  <GridTable.Cell>{t('continuousScreening:observability.grid_versions_items_ingested')}</GridTable.Cell>
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
                      <GridStatus status={item.status} progressValue={getProgressValue(item)} errors={item.errors} />
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
