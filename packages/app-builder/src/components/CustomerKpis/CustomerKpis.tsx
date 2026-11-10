import { CurrentUser, isAdmin } from '@app-builder/models';
import { useCustomerAggregatesQuery } from '@app-builder/queries/customer-aggregates/get-customer-aggregates';
import { useFormatLanguage } from '@app-builder/utils/format';
import { type CustomerAggregateDto, type CustomerAggregateResultDto } from 'marble-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, cn, Popover } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CustomerKpisConfigurationPopover } from './CustomerKpisConfigurationPopover';

type CustomerKpisProps = {
  currentUser: CurrentUser;
  objectId: string;
  objectType: string;
  /** Tinted tiles with the value in the accent colour, as in the data exploration panel. */
  tinted?: boolean;
};

type CustomerKpiCardProps = {
  currentUser: CurrentUser;
  aggregate: CustomerAggregateDto;
  language: string;
  tinted?: boolean;
  onEdit: () => void;
};

function tileClassName(tinted: boolean | undefined) {
  return cn(
    'flex min-h-17 min-w-0 flex-1 flex-col justify-center gap-xs rounded-md border border-grey-border p-3',
    tinted ? 'bg-grey-background-light' : 'bg-surface-card',
  );
}

export function CustomerKpis({ currentUser, objectId, objectType, tinted }: CustomerKpisProps) {
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
        className={cn(tileClassName(tinted), 'animate-pulse bg-grey-background')}
      />
    ))
    .with({ isError: true }, () => (
      <div className={cn(tileClassName(tinted), 'flex-row items-center justify-center gap-sm')}>
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
          <div className={cn('flex', tinted ? 'gap-md' : 'gap-sm')}>
            {data.map((aggregate) => (
              <CustomerKpiCard
                key={aggregate.id}
                currentUser={currentUser}
                aggregate={aggregate}
                language={language}
                tinted={tinted}
                onEdit={() => {
                  setEditingAggregate(aggregate);
                  setOpen(true);
                }}
              />
            ))}
            {data.length === 0 ? (
              <CustomerKpisConfigurationCard variant="empty" tinted={tinted} onOpen={() => setEditingAggregate(null)} />
            ) : isAdmin(currentUser) && data.length < 3 ? (
              <CustomerKpisConfigurationCard variant="add" tinted={tinted} onOpen={() => setEditingAggregate(null)} />
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

function CustomerKpiCard({ currentUser, aggregate, language, tinted, onEdit }: CustomerKpiCardProps) {
  const { t } = useTranslation(['common', 'client360']);
  const metrics = getAggregateMetrics(aggregate.results);

  return (
    <div className={tileClassName(tinted)}>
      <div className="flex items-start gap-sm">
        <span className="min-w-0 flex-1 text-small text-grey-placeholder">{aggregate.name}</span>
        {isAdmin(currentUser) && (
          <Button aria-label={t('common:edit')} variant="secondary" mode="icon" size="small" onClick={onEdit}>
            <Icon aria-hidden="true" icon="edit" className="size-4" />
          </Button>
        )}
      </div>
      {metrics ? (
        <div className="flex items-center gap-sm">
          <span className={cn('text-small font-medium tabular-nums', tinted && 'text-purple-primary')}>
            {formatMetric(metrics.current, language)}
          </span>
          <CustomerKpiChange percentageChange={metrics.percentageChange} language={language} />
        </div>
      ) : (
        <span className="text-small text-grey-secondary">{t('client360:customer_kpis.status.unavailable')}</span>
      )}
    </div>
  );
}

function CustomerKpiChange({ percentageChange, language }: { percentageChange: number | null; language: string }) {
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

type CustomerKpisConfigurationCardProps = {
  variant: 'empty' | 'add';
  tinted?: boolean;
  onOpen: () => void;
};

function CustomerKpisConfigurationCard({ variant, tinted, onOpen }: CustomerKpisConfigurationCardProps) {
  const { t } = useTranslation(['client360']);

  return (
    <div className={cn(tileClassName(tinted), 'items-start')}>
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

function getAggregateMetrics(results: CustomerAggregateResultDto[] | undefined) {
  return match(results)
    .when(
      (values): values is [CustomerAggregateResultDto, CustomerAggregateResultDto] => values?.length === 2,
      ([current, previous]) => ({
        current: current.value,
        percentageChange: match(previous.value)
          .with(0, () => null)
          .otherwise(() => ((current.value - previous.value) / previous.value) * 100),
      }),
    )
    .otherwise(() => null);
}

function formatMetric(value: number, language: string) {
  return new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(value);
}

function formatPercentage(value: number, language: string) {
  return `${new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(Math.abs(value))}%`;
}
