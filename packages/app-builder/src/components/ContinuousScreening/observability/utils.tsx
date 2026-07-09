import {
  ContinuousScreeningJobError,
  ContinuousScreeningUpdateJobSummary,
} from '@app-builder/models/continuous-screening';
import { formatOptionalDateAtTime } from '@app-builder/utils/datetime';
import { useFormatLanguage, useFormatTimezone } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Tag, TagProps, Tooltip } from 'ui-design-system';
import { Icon, IconName } from 'ui-icons';

export const LIMLIT_FOR_PANELS = 20;

export function useDateAtFormat() {
  const locale = useFormatLanguage();
  const timezone = useFormatTimezone();
  const { t } = useTranslation(['continuousScreening']);

  const dateFormatter = (dt: string) =>
    formatOptionalDateAtTime(dt, {
      locale,
      timeZone: timezone,
      todayLabel: t('continuousScreening:observability.today'),
      yesterdayLabel: t('continuousScreening:observability.yesterday'),
      atSeparator: t('continuousScreening:observability.date_time_separator'),
    });
  return { dateFormatter };
}

export function TagStatus({
  status,
  children,
  className,
}: {
  status: ContinuousScreeningUpdateJobSummary['status'];
  children: React.ReactNode;
  className?: string;
}) {
  const color = match(status)
    .with('completed', () => 'green')
    .with('failed', () => 'red')
    .with('processing', () => 'yellow')
    .with('pending', () => 'yellow')
    .otherwise(() => 'white') as TagProps['color'];

  const icon = match(status)
    .with('completed', () => 'tick')
    .with('failed', () => 'x')
    .with('processing', () => 'in-progress')
    .with('pending', () => 'schedule')
    .otherwise(() => 'info') as IconName;

  return (
    <Tag color={color} className={className}>
      <Icon icon={icon} className="size-4" />
      {children}
    </Tag>
  );
}

export function GridStatus({
  status,
  progressValue,
  errors = [],
}: {
  status: ContinuousScreeningUpdateJobSummary['status'];
  progressValue: number | null;
  errors?: ContinuousScreeningJobError[];
}) {
  const { t } = useTranslation(['continuousScreening']);
  if (status === 'completed')
    return (
      <TagStatus status="completed">{t('continuousScreening:observability.grid_versions_status_completed')}</TagStatus>
    );
  if (status === 'failed') {
    return (
      <TagStatus status="failed">
        <span>{t('continuousScreening:observability.grid_versions_status_failed')}</span>
        {(errors ?? []).length > 0 ? (
          <Tooltip.Default
            content={
              <ul className="max-w-lg">
                {(errors ?? [])
                  .map((error) => error.details?.error)
                  .filter(Boolean)
                  .map((error) => (
                    <li key={error}>{error}</li>
                  ))}
              </ul>
            }
          >
            <Icon icon="tip" className="size-4" />
          </Tooltip.Default>
        ) : null}
      </TagStatus>
    );
  }
  if (status === 'pending')
    return (
      <TagStatus status="pending">{t('continuousScreening:observability.grid_versions_status_pending')}</TagStatus>
    );
  return (
    <TagStatus status="processing">
      {progressValue === null
        ? t('continuousScreening:observability.grid_versions_status_processing')
        : t('continuousScreening:observability.grid_versions_status_in_progress', { progressValue })}
    </TagStatus>
  );
}

export function getProgressValue({
  itemsProcessed,
  totalItems,
}: Pick<ContinuousScreeningUpdateJobSummary, 'itemsProcessed' | 'totalItems'>) {
  if (itemsProcessed === null || itemsProcessed === undefined || !totalItems || totalItems <= 0) return 0;
  return Math.round((itemsProcessed / totalItems) * 100);
}
