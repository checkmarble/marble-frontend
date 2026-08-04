import { type CaseStatus } from '@app-builder/models/cases';
import { getDueDateUrgency } from '@app-builder/utils/datetime';
import { useFormatTimezone } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';

interface CaseDueDateUrgencyTagProps {
  dueAt?: string | null;
  status: CaseStatus;
}

export function CaseDueDateUrgencyTag({ dueAt, status }: CaseDueDateUrgencyTagProps) {
  const { t } = useTranslation(['cases']);
  const timeZone = useFormatTimezone();

  if (status === 'closed') return null;

  const urgency = getDueDateUrgency(dueAt, { timeZone });
  if (!urgency) return null;

  if (urgency.kind === 'left') {
    return (
      <Tag color="orange" size="small">
        {t('cases:inbox.due.left', { count: urgency.days })}
      </Tag>
    );
  }

  return (
    <Tag color="red" size="small">
      {t('cases:inbox.due.late', { count: urgency.days })}
    </Tag>
  );
}
