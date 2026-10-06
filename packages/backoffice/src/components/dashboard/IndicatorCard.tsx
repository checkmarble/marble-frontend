import { formatDate, formatDateTime, WeeklyChart } from '@bo/components/dashboard/WeeklyChart';
import type { DashboardEntity, DashboardMode } from '@bo/schemas/dashboard';
import { Link } from '@tanstack/react-router';
import type { DashboardIndicator } from 'marble-api';
import { RadioGroup, RadioGroupItem, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

type IndicatorCardProps = {
  entity: DashboardEntity;
  label: string;
  destination: '/organizations' | '/tenants' | '/users' | '/licenses';
  indicator: DashboardIndicator;
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
};

export function IndicatorCard({ entity, label, destination, indicator, mode, onModeChange }: IndicatorCardProps) {
  const coverageSince = mode === 'all' ? indicator.coverage.all_since : indicator.coverage.new_since;
  const hasGaps = indicator.weeks.some((week) => week[mode] === null);
  const hasPartialWeeks = indicator.weeks.some((week) => week.partial);
  const hasHints = hasGaps || hasPartialWeeks;

  return (
    <section
      aria-labelledby={`${entity}-title`}
      className="flex min-w-0 flex-col gap-lg rounded-xl border border-grey-border bg-surface-card p-lg"
    >
      <header className="flex flex-col gap-sm">
        <h2 id={`${entity}-title`} className="text-l font-semibold">
          {label}
        </h2>
        <div className="flex flex-wrap items-baseline gap-sm">
          <span className="text-2xl font-semibold tabular-nums">
            {new Intl.NumberFormat('en-GB').format(indicator.total)}
          </span>
          <span className="text-xs text-grey-secondary">currently listed</span>
        </div>
        {indicator.total === 0 ? (
          <p className="text-s text-grey-secondary">No {label.toLowerCase()} currently listed.</p>
        ) : null}
      </header>

      <div className="flex flex-col gap-sm">
        <div className="flex flex-wrap items-center justify-between gap-sm">
          <h3 className="text-s font-medium flex gap-sm items-center">
            Weekly evolution
            {hasHints ? (
              <Tooltip.Default
                content={
                  <div className="flex flex-col gap-xs text-xs text-grey-secondary">
                    {hasGaps ? <p>Gaps mean audit history is unavailable, rather than zero activity.</p> : null}
                    {hasGaps && coverageSince ? (
                      <p>
                        Reliable {mode === 'all' ? 'population' : 'creation'} history from{' '}
                        {formatDateTime(coverageSince)} UTC.
                      </p>
                    ) : null}
                    {hasGaps && !coverageSince ? <p>Historical audit coverage has not been established.</p> : null}
                    {hasPartialWeeks ? (
                      <p>
                        Outlined points or bars mark partial weeks at the range, coverage, or current-week boundary.
                      </p>
                    ) : null}
                  </div>
                }
              >
                <Icon icon="tip" className="size-4" />
              </Tooltip.Default>
            ) : null}
          </h3>
          <RadioGroup
            aria-label={`${label} measure`}
            value={mode}
            onValueChange={(value) => {
              if (value === 'all' || value === 'new') onModeChange(value);
            }}
          >
            <RadioGroupItem value="all" className="px-sm">
              All
            </RadioGroupItem>
            <RadioGroupItem value="new" className="px-sm">
              New
            </RadioGroupItem>
          </RadioGroup>
        </div>
        <p className="text-xs text-grey-secondary">
          {mode === 'all'
            ? 'Listed at week end; the current week shows the total so far.'
            : 'Created during each week, including records later deleted or merged.'}
        </p>
        <WeeklyChart weeks={indicator.weeks} mode={mode} label={label} />
      </div>

      <div className="flex flex-col gap-sm border-t border-grey-border pt-md">
        <h3 className="text-s font-medium">Most recently created</h3>
        {indicator.recent.length > 0 ? (
          <ul className="flex flex-col gap-sm">
            {indicator.recent.map((record) => (
              <li key={record.id} className="flex min-w-0 flex-col gap-2xs">
                <span className="truncate text-s" title={record.name}>
                  {record.name}
                </span>
                <time dateTime={record.created_at} className="text-xs text-grey-secondary">
                  {formatDate(record.created_at)} UTC
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-grey-secondary">
            {indicator.total === 0 ? 'No records to show.' : 'No listed records have a known creation date.'}
          </p>
        )}
        {indicator.recent_has_unknown && indicator.recent.length > 0 && indicator.recent.length < 3 ? (
          <p className="text-xs text-grey-secondary">
            Only records with an audit-recorded creation date are shown. Some dates are unknown.
          </p>
        ) : null}
      </div>

      <Link
        to={destination}
        className="flex w-fit items-center gap-xs text-s font-medium text-purple-primary hover:underline"
      >
        View all {label.toLowerCase()}
        <Icon icon="arrow-right" className="size-4" />
      </Link>
    </section>
  );
}
