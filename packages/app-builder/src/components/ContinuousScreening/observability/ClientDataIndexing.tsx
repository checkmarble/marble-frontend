import { Callout } from '@app-builder/components/Callout';
import GridTable from '@app-builder/components/GridTable';
import { Panel } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import type { ContinuousScreeningClientDataIndexingResponse } from '@app-builder/models/continuous-screening';
import { useContinuousScreeningClientDataIndexingInfiniteQuery } from '@app-builder/queries/continuous-screening/client-data-indexing';
import { formatNumber } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Card, DefaultTooltip, Typo, useFormatLanguage } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { LIMLIT_FOR_PANELS, TagStatus, useDateAtFormat } from './utils';

export function ClientDataIndexing({ data }: { data: ContinuousScreeningClientDataIndexingResponse | null }) {
  const { t } = useTranslation(['common', 'continuousScreening']);

  if (data === null) {
    return (
      <Card className="p-md grid place-items-center mb-auto">
        <div className="text-grey-secondary p-md text-center text-xs">{t('common:global_error')}</div>
      </Card>
    );
  }

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
          <ClientDataIndexingFreshness data={data} />

          {data.pendingItems > 0 ? (
            <TagStatus status="pending">
              {t('continuousScreening:observability.client_data_indexing_pending', {
                count: data.pendingItems > 1000 ? '1000+' : data.pendingItems,
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

function ClientDataIndexingFreshness({ data }: { data: ContinuousScreeningClientDataIndexingResponse }) {
  const { t } = useTranslation(['continuousScreening']);

  if (data.version === '') {
    return (
      <TagStatus status="pending" className="w-fit">
        {t('continuousScreening:observability.client_data_indexing_dataset_missing')}
      </TagStatus>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-sm text-sm">
      <span>
        {t('continuousScreening:observability.client_data_indexing_dataset_version', {
          version: data.version,
        })}
      </span>
      <span className="text-grey-secondary">
        {data.indexVersion === null
          ? t('continuousScreening:observability.client_data_indexing_index_missing')
          : t('continuousScreening:observability.client_data_indexing_index_version', {
              version: data.indexVersion,
            })}
      </span>
      <TagStatus status={data.indexCurrent ? 'completed' : 'pending'} className="w-fit">
        {data.indexCurrent
          ? t('continuousScreening:observability.client_data_indexing_index_current')
          : data.indexVersion === null
            ? t('continuousScreening:observability.client_data_indexing_index_pending')
            : t('continuousScreening:observability.client_data_indexing_index_outdated')}
      </TagStatus>
    </div>
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
              <GridTable.Table className="grid-cols-4">
                <GridTable.Row className="font-semibold border-b border-grey-border">
                  <GridTable.Cell>{t('continuousScreening:observability.dataset_updates_date')}</GridTable.Cell>
                  <GridTable.Cell>{t('continuousScreening:observability.client_data_indexing_version')}</GridTable.Cell>
                  <GridTable.Cell>
                    {t('continuousScreening:observability.client_data_indexing_object_type')}
                  </GridTable.Cell>
                  <GridTable.Cell>{t('continuousScreening:observability.grid_versions_items_ingested')}</GridTable.Cell>
                </GridTable.Row>
                {items.map((item) => (
                  <GridTable.Row key={item.id}>
                    <GridTable.Cell>{dateFormatter(item.jobDate)}</GridTable.Cell>
                    <GridTable.Cell>{item.version}</GridTable.Cell>
                    <GridTable.Cell>{item.objectType}</GridTable.Cell>
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
  );
}

type ClientDataIndexingContentProps = {
  data: ContinuousScreeningClientDataIndexingResponse;
};

function ClientDataIndexingContent({ data }: ClientDataIndexingContentProps) {
  const locale = useFormatLanguage();

  const indexedItems = data.items.slice(0, 5);

  const { dateFormatter } = useDateAtFormat();

  return (
    <div className="grid grid-cols-[30%_auto_1fr] gap-md items-center">
      {indexedItems.map((item) => (
        <div key={item.id} className="grid col-span-full grid-cols-subgrid items-center">
          <time dateTime={item.jobDate} className="text-grey-secondary">
            {dateFormatter(item.jobDate)}
          </time>
          <TagStatus status="completed" className="gap-sm w-fit">
            {formatNumber(item.totalItems, { language: locale })}
          </TagStatus>
        </div>
      ))}
    </div>
  );
}
