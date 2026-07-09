import { ContinuousScreeningUpdateJobSummary } from '@app-builder/models/continuous-screening';
import { formatOptionalDateAtTime } from '@app-builder/utils/datetime';
import { useFormatLanguage, useFormatTimezone } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Tag, TagProps } from 'ui-design-system';
import { Icon, IconName } from 'ui-icons';

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
