import { type ScreeningStatus } from '@app-builder/models/screening';
import { type ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';

import { sanctionsI18n } from './screenings-i18n';

const screeningStatusMapping = {
  in_review: { color: 'orange', tKey: 'sanctions:status.in_review' },
  confirmed_hit: { color: 'red', tKey: 'sanctions:status.confirmed_hit' },
  no_hit: { color: 'green', tKey: 'sanctions:status.no_hit' },
  error: { color: 'red', tKey: 'sanctions:status.error' },
} satisfies Record<
  ScreeningStatus,
  {
    color: 'orange' | 'red' | 'green';
    tKey: ParseKeys<['sanctions']>;
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
  const { t } = useTranslation(sanctionsI18n);
  const screeningStatus = screeningStatusMapping[status];

  return (
    <Tag border={border} color={screeningStatus.color} className={className}>
      {t(screeningStatus.tKey)}
    </Tag>
  );
}
