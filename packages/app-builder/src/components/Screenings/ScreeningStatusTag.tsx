import { type ScreeningStatus } from '@app-builder/models/screening';
import { type ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';

import { screeningsI18n } from './screenings-i18n';

const screeningStatusMapping = {
  in_review: { color: 'orange', tKey: 'screenings:status.in_review' },
  confirmed_hit: { color: 'red', tKey: 'screenings:status.confirmed_hit' },
  no_hit: { color: 'green', tKey: 'screenings:status.no_hit' },
  error: { color: 'red', tKey: 'screenings:status.error' },
} satisfies Record<
  ScreeningStatus,
  {
    color: 'orange' | 'red' | 'green';
    tKey: ParseKeys<['screenings']>;
  }
>;

export function ScreeningStatusTag({
  status,
  border,
  className,
}: {
  status: ScreeningStatus;
  border?: 'rounded-sm' | 'square';
  className?: string;
}) {
  const { t } = useTranslation(screeningsI18n);
  const screeningStatus = screeningStatusMapping[status];

  return (
    <Tag border={border} color={screeningStatus.color} className={className}>
      {t(screeningStatus.tKey)}
    </Tag>
  );
}
