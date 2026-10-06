import { Sparkline } from '@bo/components/dashboard/Sparkline';
import { TrendChart } from '@bo/components/dashboard/TrendChart';
import { WeeklyDataTable } from '@bo/components/dashboard/WeeklyDataTable';
import { DASHBOARD_ENTITIES, type DashboardEntity } from '@bo/schemas/dashboard';
import {
  formatCount,
  formatDate,
  formatShortDate,
  formatSigned,
  type IndicatorSummary,
  summarizeIndicator,
} from '@bo/utils/dashboard-indicator';
import { Link } from '@tanstack/react-router';
import type { DashboardMetrics } from 'marble-api';
import { useRef } from 'react';
import { cn, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

const ENTITY_META = {
  organizations: { label: 'Organizations', destination: '/organizations' },
  tenants: { label: 'Tenants', destination: '/tenants' },
  users: { label: 'Users', destination: '/users' },
  licenses: { label: 'Licences', destination: '/licenses' },
} as const satisfies Record<DashboardEntity, { label: string; destination: string }>;

type DashboardCardsProps = {
  indicators: DashboardMetrics['indicators'];
  selected: DashboardEntity;
  onSelectedChange: (entity: DashboardEntity) => void;
};

/**
 * The four platform indicators as selectable tiles, with a detail panel for the selected one showing
 * both measures: listed population (line) above weekly creations (bars), on the same weeks.
 */
export function DashboardCards({ indicators, selected, onSelectedChange }: DashboardCardsProps) {
  const tabs = useRef<Partial<Record<DashboardEntity, HTMLButtonElement | null>>>({});
  const summary = summarizeIndicator(indicators[selected]);
  const { label, destination } = ENTITY_META[selected];

  const focusTab = (entity: DashboardEntity) => {
    onSelectedChange(entity);
    tabs.current[entity]?.focus();
  };

  return (
    <div className="grid items-start gap-lg lg:grid-cols-[17rem_minmax(0,1fr)]">
      <div
        role="tablist"
        aria-label="Indicators"
        aria-orientation="vertical"
        className="flex flex-col gap-sm"
        onKeyDown={(event) => {
          const index = DASHBOARD_ENTITIES.indexOf(selected);
          const last = DASHBOARD_ENTITIES.length - 1;
          const next =
            event.key === 'ArrowDown' || event.key === 'ArrowRight'
              ? DASHBOARD_ENTITIES[index === last ? 0 : index + 1]
              : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
                ? DASHBOARD_ENTITIES[index === 0 ? last : index - 1]
                : event.key === 'Home'
                  ? DASHBOARD_ENTITIES[0]
                  : event.key === 'End'
                    ? DASHBOARD_ENTITIES[last]
                    : undefined;
          if (!next) return;
          event.preventDefault();
          focusTab(next);
        }}
      >
        {DASHBOARD_ENTITIES.map((entity) => {
          const tile = summarizeIndicator(indicators[entity]);
          const isSelected = entity === selected;
          return (
            <button
              key={entity}
              ref={(element) => {
                tabs.current[entity] = element;
              }}
              id={`${entity}-tab`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="indicator-panel"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelectedChange(entity)}
              className={cn(
                'flex flex-col gap-2xs rounded-xl border bg-surface-card p-md text-left transition-colors',
                isSelected
                  ? 'border-purple-primary ring-1 ring-purple-primary'
                  : 'border-grey-border hover:border-grey-secondary',
              )}
            >
              <span className="flex items-baseline justify-between gap-sm">
                <span className="text-s text-grey-secondary">{ENTITY_META[entity].label}</span>
                {tile.netChange ? (
                  <span className="text-xs text-grey-secondary">{formatSigned(tile.netChange.value)}</span>
                ) : null}
              </span>
              <span className="text-2xl font-semibold">{formatCount(tile.total)}</span>
              <Sparkline points={tile.series.all} label={ENTITY_META[entity].label} height={28} />
            </button>
          );
        })}
      </div>

      <section
        id="indicator-panel"
        role="tabpanel"
        aria-labelledby="indicator-panel-title"
        className="flex min-w-0 flex-col gap-lg rounded-xl border border-grey-border bg-surface-card p-lg"
      >
        <header className="flex flex-wrap items-end justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h2 id="indicator-panel-title" className="text-l font-semibold">
              {label}
            </h2>
            <div className="flex flex-wrap items-baseline gap-md">
              <span className="text-h1 font-semibold leading-none">{formatCount(summary.total)}</span>
              <span className="text-s text-grey-secondary">
                currently listed
                {summary.netChange
                  ? ` · ${formatSigned(summary.netChange.value)} since ${formatShortDate(summary.netChange.since)}`
                  : ''}
                {summary.created
                  ? ` · ${summary.created.complete ? '' : 'at least '}${formatCount(summary.created.value)} created`
                  : ''}
              </span>
            </div>
            {summary.total === 0 ? (
              <p className="text-s text-grey-secondary">No {label.toLowerCase()} currently listed.</p>
            ) : null}
          </div>
          <Link
            to={destination}
            className="flex items-center gap-xs text-s font-medium text-purple-primary hover:underline"
          >
            View all {label.toLowerCase()}
            <Icon icon="arrow-right" className="size-4" />
          </Link>
        </header>

        <div className="flex flex-col gap-xs">
          <h3 className="flex items-center gap-xs text-s font-medium">
            Listed
            <HintTip lines={summary.hints.all} />
          </h3>
          <p className="text-xs text-grey-secondary">Listed at week end; the current week shows the total so far.</p>
          <TrendChart points={summary.series.all} kind="line" label={label} measure="listed" height={180} />
        </div>
        <div className="flex flex-col gap-xs">
          <h3 className="flex items-center gap-xs text-s font-medium">
            Created per week
            <HintTip lines={summary.hints.new} />
          </h3>
          <p className="text-xs text-grey-secondary">
            Created during each week, including records later deleted or merged.
          </p>
          <TrendChart points={summary.series.new} kind="bars" label={label} measure="new" height={130} />
        </div>
        <WeeklyDataTable
          label={label}
          columns={[
            { header: 'All', points: summary.series.all },
            { header: 'New', points: summary.series.new },
          ]}
        />

        <div className="flex flex-col gap-sm border-t border-grey-border pt-md">
          <h3 className="text-s font-medium">Most recently created</h3>
          <RecentRecords summary={summary} />
        </div>
      </section>
    </div>
  );
}

export function DashboardCardsSkeleton() {
  return (
    <div
      className="grid items-start gap-lg lg:grid-cols-[17rem_minmax(0,1fr)]"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <span className="sr-only" role="status">
        Loading dashboard indicators…
      </span>
      <div className="flex flex-col gap-sm">
        {DASHBOARD_ENTITIES.map((entity) => (
          <div key={entity} className="flex flex-col gap-xs rounded-xl border border-grey-border bg-surface-card p-md">
            <span className="text-s text-grey-secondary">{ENTITY_META[entity].label}</span>
            <div className="h-8 w-20 animate-pulse rounded bg-grey-background-light" />
            <div className="h-7 animate-pulse rounded bg-grey-background-light" />
          </div>
        ))}
      </div>
      <div className="h-[36rem] animate-pulse rounded-xl bg-grey-background-light" />
    </div>
  );
}

function HintTip({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null;
  return (
    <Tooltip.Default
      content={
        <div className="flex max-w-72 flex-col gap-xs text-xs text-grey-secondary">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      }
    >
      <Icon icon="tip" className="size-4 text-grey-secondary" aria-label="About this chart" />
    </Tooltip.Default>
  );
}

function RecentRecords({ summary }: { summary: IndicatorSummary }) {
  if (summary.recent.kind === 'none') {
    return (
      <p className="text-xs text-grey-secondary">
        {summary.recent.reason === 'no-records'
          ? 'No records to show.'
          : 'No listed records have a known creation date.'}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-sm">
      <ul className="flex flex-col gap-xs">
        {summary.recent.items.map((record) => (
          <li key={record.id} className="flex min-w-0 items-baseline justify-between gap-sm">
            <span className="truncate text-s" title={record.name}>
              {record.name}
            </span>
            <time dateTime={record.created_at} className="shrink-0 text-xs text-grey-secondary">
              {formatDate(record.created_at)}
            </time>
          </li>
        ))}
      </ul>
      {summary.recent.someDatesUnknown ? (
        <p className="text-xs text-grey-secondary">
          Only records with an audit-recorded creation date are shown. Some dates are unknown.
        </p>
      ) : null}
    </div>
  );
}
