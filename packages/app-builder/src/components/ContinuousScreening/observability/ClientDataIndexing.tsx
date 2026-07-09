import { Callout } from '@app-builder/components/Callout';
import GridTable from '@app-builder/components/GridTable';
import { Panel } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { ContinuousScreeningClientDataIndexing } from '@app-builder/models/continuous-screening';
import { useContinuousScreeningClientDataIndexingInfiniteQuery } from '@app-builder/queries/continuous-screening/client-data-indexing';
import { formatNumber } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Card, DefaultTooltip, Tooltip, Typo, useFormatLanguage } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { GridStatus, getProgressValue, LIMLIT_FOR_PANELS, TagStatus, useDateAtFormat } from './utils';

function isPendingIndexing(item: ContinuousScreeningClientDataIndexing) {
  return item.status !== 'completed' && item.status !== 'failed';
}

export function ClientDataIndexing({ data }: { data: ContinuousScreeningClientDataIndexing[] }) {
  const { t } = useTranslation(['continuousScreening']);
  const clientDataIndexingPendingCount = data
    .filter(isPendingIndexing)
    .reduce((acc, item) => acc + (item.totalItems - (item.itemsProcessed ?? 0)), 0);

  return (
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
            <TagStatus status="pending">
              {t('continuousScreening:observability.client_data_indexing_pending', {
                count: clientDataIndexingPendingCount,
              })}
            </TagStatus>
          ) : null}
          <PanelCientIndexing />
        </div>
      </header>
      <Callout color="purple">{t('continuousScreening:observability.client_data_indexing_callout')}</Callout>
      <ClientDataIndexingContent data={data} />
    </Card>
  );
}

function PanelCientIndexing() {
  return (
    <Panel.Root>
      <Panel.Trigger>
        <Icon icon="eye" className="size-4" />
      </Panel.Trigger>
      <Panel.Container size="medium">
        <PanelCientIndexingContent />
      </Panel.Container>
    </Panel.Root>
  );
}

function PanelCientIndexingContent() {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const locale = useFormatLanguage();
  const query = useContinuousScreeningClientDataIndexingInfiniteQuery(LIMLIT_FOR_PANELS);
  const { dateFormatter } = useDateAtFormat();

  return (
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
                  <GridTable.Cell>{t('continuousScreening:observability.grid_versions_items_ingested')}</GridTable.Cell>
                  <GridTable.Cell>{t('continuousScreening:observability.grid_versions_status')}</GridTable.Cell>
                </GridTable.Row>
                {items.map((item) => (
                  <GridTable.Row key={item.id}>
                    <GridTable.Cell>{dateFormatter(item.jobStart)}</GridTable.Cell>
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

type ClientDataIndexingContentProps = {
  data: ContinuousScreeningClientDataIndexing[];
};

function ClientDataIndexingContent({ data }: ClientDataIndexingContentProps) {
  const locale = useFormatLanguage();

  const terminalItems = data.filter((item) => !isPendingIndexing(item)).slice(0, 5);

  const { dateFormatter } = useDateAtFormat();

  return (
    <div className="grid grid-cols-[30%_auto_1fr] gap-md items-center">
      {terminalItems.map((item) => (
        <div key={item.id} className="grid col-span-full grid-cols-subgrid items-center">
          <time dateTime={item.jobStart} className="text-grey-secondary">
            {dateFormatter(item.jobStart)}
          </time>
          <TagStatus status={item.status} className="gap-sm w-fit">
            {formatNumber(item.totalItems, { language: locale })}
          </TagStatus>
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
      ))}
    </div>
  );
}
