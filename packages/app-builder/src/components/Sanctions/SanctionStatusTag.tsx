import { type SanctionCheckStatus } from '@app-builder/models/sanction-check';
import { type ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';

import { sanctionsI18n } from './sanctions-i18n';

const sanctionStatusMapping = {
  in_review: { color: 'orange', tKey: 'sanctions:status.in_review' },
  confirmed_hit: { color: 'red', tKey: 'sanctions:status.confirmed_hit' },
  no_hit: { color: 'green', tKey: 'sanctions:status.no_hit' },
  error: { color: 'red', tKey: 'sanctions:status.error' },
} satisfies Record<
  SanctionCheckStatus,
  {
    color: 'orange' | 'red' | 'green';
    tKey: ParseKeys<['sanctions']>;
  }
>;

export function SanctionStatusTag({
  status,
  border,
  className,
}: {
  status: SanctionCheckStatus;
  border?: 'rounded-sm' | 'square';
  className?: string;
}) {
  const { t } = useTranslation(sanctionsI18n);
  const sanctionStatus = sanctionStatusMapping[status];

  return (
    <Tag border={border} color={sanctionStatus.color} className={className}>
      {t(sanctionStatus.tKey)}
    </Tag>
  );
}
