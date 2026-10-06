import { DashboardCards, DashboardCardsSkeleton } from '@bo/components/dashboard/DashboardCards';
import { dashboardQueryOptions } from '@bo/data/dashboard';
import { useDashboardPreferences } from '@bo/hooks/useDashboardPreferences';
import { DASHBOARD_PERIODS } from '@bo/schemas/dashboard';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button, cn, RadioGroup, RadioGroupItem } from 'ui-design-system';

export function DashboardPage() {
  const { preferences, updatePreferences } = useDashboardPreferences();
  const query = useQuery(dashboardQueryOptions(preferences.months));
  const [preferenceError, setPreferenceError] = useState(false);

  const savePreferences: typeof updatePreferences = async (patch) => {
    setPreferenceError(false);
    try {
      await updatePreferences(patch);
    } catch {
      setPreferenceError(true);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-lg pb-xl">
      <header className="flex flex-wrap items-end justify-between gap-md">
        <div className="flex flex-col gap-xs">
          <h1 className="text-h1 font-semibold">Dashboard</h1>
          <p className="text-s text-grey-secondary">
            Platform totals and weekly activity. Weeks start on Monday, in UTC.
          </p>
        </div>
        <div className="flex flex-col gap-xs">
          <span className="text-xs text-grey-secondary">History period</span>
          <RadioGroup
            aria-label="History period"
            value={String(preferences.months)}
            onValueChange={(value) => {
              const months = DASHBOARD_PERIODS.find((period) => String(period) === value);
              if (months) void savePreferences({ months });
            }}
          >
            {DASHBOARD_PERIODS.map((months) => (
              <RadioGroupItem key={months} value={String(months)} className="px-xs text-xs sm:px-sm sm:text-s">
                {months} {months === 1 ? 'month' : 'months'}
              </RadioGroupItem>
            ))}
          </RadioGroup>
        </div>
      </header>

      {preferenceError ? (
        <p role="alert" className="text-s text-red-47">
          Could not save your dashboard settings. Please try your selection again.
        </p>
      ) : null}

      {query.isPending ? (
        <DashboardCardsSkeleton />
      ) : query.data ? (
        <>
          {query.isError ? (
            <div role="alert" className="flex flex-wrap items-center gap-sm text-s text-red-47">
              <span>Could not refresh the dashboard. The previous snapshot is shown.</span>
              <Button variant="secondary" size="small" onClick={() => void query.refetch()}>
                Retry
              </Button>
            </div>
          ) : null}
          <div aria-busy={query.isFetching} className={cn('transition-opacity', query.isFetching && 'opacity-60')}>
            <DashboardCards
              indicators={query.data.indicators}
              selected={preferences.indicator}
              onSelectedChange={(indicator) => void savePreferences({ indicator })}
            />
          </div>
          <p className="text-xs text-grey-secondary" role="status">
            {query.isFetching ? 'Refreshing…' : 'Snapshot: '}
            {!query.isFetching ? (
              <time dateTime={query.data.generated_at}>{formatSnapshot(query.data.generated_at)} UTC</time>
            ) : null}
          </p>
        </>
      ) : (
        <div
          role="alert"
          className="flex flex-col items-center gap-md rounded-xl border border-grey-border bg-surface-card p-2xl text-center"
        >
          <p className="font-medium">Could not load the dashboard.</p>
          <p className="text-s text-grey-secondary">Try again to load the platform indicators.</p>
          <Button variant="secondary" onClick={() => void query.refetch()}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}

function formatSnapshot(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(value));
}
