import { CurrentUser, isAdmin } from '@app-builder/models';
import { useCustomerAggregatesQuery } from '@app-builder/queries/customer-aggregates/get-customer-aggregates';
import { useFormatLanguage } from '@app-builder/utils/format';
import { type CustomerAggregateDto } from 'marble-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, cn, Popover } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { formatMetric, formatPercentage, getAggregateMetrics } from './CustomerKpis';
import { CustomerKpisConfigurationPopover } from './CustomerKpisConfigurationPopover';

type CustomerKpiTilesProps = {
  currentUser: CurrentUser;
  objectId: string;
  objectType: string;
};

const tileClassName =
  'flex min-h-17 min-w-0 flex-1 flex-col justify-center gap-xs rounded-md border border-grey-border bg-grey-background-light p-3';

/** The customer KPIs as a row of compact tiles, for the data exploration panel. Elsewhere, use `CustomerKpis`. */
export function CustomerKpiTiles({ currentUser, objectId, objectType }: CustomerKpiTilesProps) {
  const { t } = useTranslation(['common', 'client360']);
  const language = useFormatLanguage();
  const [open, setOpen] = useState(false);
  const [editingAggregate, setEditingAggregate] = useState<CustomerAggregateDto | null>(null);
  const customerAggregatesQuery = useCustomerAggregatesQuery(objectType, objectId);

  function closeConfiguration() {
    setOpen(false);
    setEditingAggregate(null);
  }

  return match(customerAggregatesQuery)
    .with({ isPending: true }, () => (
      <div
        role="status"
        aria-label={t('client360:customer_kpis.status.loading')}
        className={cn(tileClassName, 'flex-none animate-pulse bg-grey-background')}
      />
    ))
    .with({ isError: true }, () => (
      <div className={cn(tileClassName, 'flex-none flex-row items-center justify-center gap-sm')}>
        <span className="text-small text-grey-secondary">{t('common:generic_fetch_data_error')}</span>
        <Button size="small" variant="secondary" onClick={() => customerAggregatesQuery.refetch()}>
          {t('common:retry')}
        </Button>
      </div>
    ))
    .with({ isSuccess: true }, ({ data }) => (
      <Popover.Root
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setEditingAggregate(null);
        }}
      >
        <Popover.Anchor>
          <div className="flex gap-md">
            {data.map((aggregate) => (
              <CustomerKpiTile
                key={aggregate.id}
                currentUser={currentUser}
                aggregate={aggregate}
                language={language}
                onEdit={() => {
                  setEditingAggregate(aggregate);
                  setOpen(true);
                }}
              />
            ))}
            {data.length === 0 ? (
              <CustomerKpisConfigurationTile variant="empty" onOpen={() => setEditingAggregate(null)} />
            ) : isAdmin(currentUser) && data.length < 3 ? (
              <CustomerKpisConfigurationTile variant="add" onOpen={() => setEditingAggregate(null)} />
            ) : null}
          </div>
        </Popover.Anchor>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={4}
          collisionPadding={10}
          className="w-radix-popover-trigger min-w-180"
        >
          <CustomerKpisConfigurationPopover
            key={editingAggregate?.id ?? 'create'}
            objectId={objectId}
            objectType={objectType}
            aggregate={editingAggregate}
            onClose={closeConfiguration}
          />
        </Popover.Content>
      </Popover.Root>
    ))
    .exhaustive();
}

type CustomerKpiTileProps = {
  currentUser: CurrentUser;
  aggregate: CustomerAggregateDto;
  language: string;
  onEdit: () => void;
};

function CustomerKpiTile({ currentUser, aggregate, language, onEdit }: CustomerKpiTileProps) {
  const { t } = useTranslation(['common', 'client360']);
  const metrics = getAggregateMetrics(aggregate.results);

  return (
    <div className={tileClassName}>
      <div className="flex items-start gap-sm">
        <span className="min-w-0 flex-1 break-words text-small text-grey-placeholder">{aggregate.name}</span>
        {isAdmin(currentUser) && (
          <Button aria-label={t('common:edit')} variant="secondary" mode="icon" size="small" onClick={onEdit}>
            <Icon aria-hidden="true" icon="edit" className="size-4" />
          </Button>
        )}
      </div>
      {metrics ? (
        <div className="flex flex-wrap items-center gap-x-sm">
          <span className="text-small font-medium tabular-nums text-purple-primary">
            {formatMetric(metrics.current, language)}
          </span>
          <CustomerKpiTileChange percentageChange={metrics.percentageChange} language={language} />
        </div>
      ) : (
        <span className="text-small text-grey-secondary">{t('client360:customer_kpis.status.unavailable')}</span>
      )}
    </div>
  );
}

function CustomerKpiTileChange({ percentageChange, language }: { percentageChange: number | null; language: string }) {
  if (percentageChange === null) return null;
  if (percentageChange === 0) return <span className="text-2xs font-medium text-grey-secondary">0%</span>;

  const isNegative = percentageChange < 0;
  return (
    <div
      className={cn('flex items-center text-2xs font-medium', isNegative ? 'text-red-primary' : 'text-green-primary')}
    >
      <Icon aria-hidden="true" icon="arrow-2-up" className={cn('size-4', isNegative ? 'rotate-180' : '')} />
      <span>{formatPercentage(percentageChange, language)}</span>
    </div>
  );
}

function CustomerKpisConfigurationTile({ variant, onOpen }: { variant: 'empty' | 'add'; onOpen: () => void }) {
  const { t } = useTranslation(['client360']);

  return (
    <div className={cn(tileClassName, 'items-start')}>
      <span className="text-small text-grey-placeholder">
        {match(variant)
          .with('empty', () => t('client360:customer_kpis.card.empty_description'))
          .with('add', () => t('client360:customer_kpis.card.add_description'))
          .exhaustive()}
      </span>
      <Popover.Trigger asChild>
        <Button variant="primary" appearance="stroked" size="small" onClick={onOpen}>
          {match(variant)
            .with('empty', () => t('client360:customer_kpis.actions.configure'))
            .with('add', () => t('client360:customer_kpis.actions.create'))
            .exhaustive()}
        </Button>
      </Popover.Trigger>
    </div>
  );
}
