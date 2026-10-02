import { useCustomerAggregatesQuery } from '@app-builder/queries/customer-aggregates/get-customer-aggregates';
import { useFormatLanguage } from '@app-builder/utils/format';
import { type CustomerAggregateDto, type CustomerAggregateResultDto } from 'marble-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Card, MenuCommand, Popover } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CustomerKpisConfigurationPopover } from './CustomerKpisConfigurationPopover';

type CustomerKpisProps = {
  objectId: string;
  objectType: string;
};

type AggregateMetrics = {
  current: number;
  percentageChange: number | null;
};

type CustomerKpiCardProps = {
  aggregate: CustomerAggregateDto;
  language: string;
  onEdit: () => void;
};

export function CustomerKpis({ objectId, objectType }: CustomerKpisProps) {
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
      <Card aria-label={t('client360:customer_kpis.loading')} className="min-h-23.5 animate-pulse bg-grey-background" />
    ))
    .with({ isError: true }, () => (
      <Card className="flex min-h-23.5 flex-col items-center justify-center gap-sm text-center">
        <span className="text-small text-grey-secondary">{t('common:generic_fetch_data_error')}</span>
        <Button size="small" variant="secondary" onClick={() => customerAggregatesQuery.refetch()}>
          {t('common:retry')}
        </Button>
      </Card>
    ))
    .with({ isSuccess: true }, ({ data }) => (
      <Popover.Root
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setEditingAggregate(null);
        }}
      >
        {match(data)
          .with([], () => (
            <Popover.Anchor>
              <CustomerKpisConfigurationCard variant="empty" onOpen={() => setEditingAggregate(null)} />
            </Popover.Anchor>
          ))
          .otherwise((aggregates) => (
            <Popover.Anchor>
              <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 xl:grid-cols-3">
                {aggregates.map((aggregate) => (
                  <CustomerKpiCard
                    key={aggregate.id}
                    aggregate={aggregate}
                    language={language}
                    onEdit={() => {
                      setEditingAggregate(aggregate);
                      setOpen(true);
                    }}
                  />
                ))}
                {match(aggregates.length)
                  .when(
                    (count) => count < 3,
                    () => <CustomerKpisConfigurationCard variant="add" onOpen={() => setEditingAggregate(null)} />,
                  )
                  .otherwise(() => null)}
              </div>
            </Popover.Anchor>
          ))}
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

function CustomerKpiCard({ aggregate, language, onEdit }: CustomerKpiCardProps) {
  const { t } = useTranslation(['common', 'client360']);
  const metrics = getAggregateMetrics(aggregate.results);

  return (
    <Card className="flex min-h-36 flex-col gap-xs rounded-lg p-md">
      <div className="flex items-start gap-sm">
        <span className="min-w-0 flex-1 text-small text-grey-secondary">{aggregate.name}</span>
        <MenuCommand.Menu>
          <MenuCommand.Trigger>
            <Button aria-label={t('common:actions')} variant="secondary" appearance="link" mode="icon" size="small">
              <Icon aria-hidden="true" icon="dots-three" className="size-4" />
            </Button>
          </MenuCommand.Trigger>
          <MenuCommand.Content align="end" sideOffset={4} size="small">
            <MenuCommand.List>
              <MenuCommand.Item onSelect={onEdit}>
                <Icon icon="edit" className="size-4" />
                {t('common:edit')}
              </MenuCommand.Item>
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-xs">
        {metrics ? (
          <>
            <span className="text-default font-medium tabular-nums">{formatMetric(metrics.current, language)}</span>
            <CustomerKpiChange percentageChange={metrics.percentageChange} language={language} />
          </>
        ) : (
          <span className="text-small text-grey-secondary">{t('client360:customer_kpis.unavailable')}</span>
        )}
      </div>
    </Card>
  );
}

function CustomerKpiChange({ percentageChange, language }: { percentageChange: number | null; language: string }) {
  if (percentageChange === null) return null;
  if (percentageChange === 0) return <span className="text-small font-medium text-grey-secondary">0%</span>;

  const isNegative = percentageChange < 0;
  return (
    <div
      className={`flex items-center text-small font-medium ${isNegative ? 'text-red-primary' : 'text-green-primary'}`}
    >
      <Icon aria-hidden="true" icon="arrow-2-up" className={`size-6 -me-xs ${isNegative ? 'rotate-180' : ''}`} />
      <span>{formatPercentage(percentageChange, language)}</span>
    </div>
  );
}

type CustomerKpisConfigurationCardProps = {
  variant: 'empty' | 'add';
  onOpen: () => void;
};

function CustomerKpisConfigurationCard({ variant, onOpen }: CustomerKpisConfigurationCardProps) {
  const { t } = useTranslation(['client360']);

  return (
    <Card className="flex min-h-36 flex-col items-center justify-center gap-sm text-center">
      <span className="text-small text-grey-secondary">
        {match(variant)
          .with('empty', () => t('client360:customer_kpis.empty_state'))
          .with('add', () => t('client360:customer_kpis.add_state'))
          .exhaustive()}
      </span>
      <Popover.Trigger asChild>
        {match(variant)
          .with('empty', () => <Button onClick={onOpen}>{t('client360:customer_kpis.configure')}</Button>)
          .with('add', () => (
            <Button variant="primary" appearance="stroked" onClick={onOpen}>
              {t('client360:customer_kpis.create')}
            </Button>
          ))
          .exhaustive()}
      </Popover.Trigger>
    </Card>
  );
}

function getAggregateMetrics(results: CustomerAggregateResultDto[] | undefined): AggregateMetrics | null {
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
