import { ContinuousScreeningBase } from '@app-builder/models/continuous-screening';
import { useTranslation } from 'react-i18next';
import { Tag, TagProps } from 'ui-design-system';

const CONTINUOUS_SCREENING_STATUS_COLOR_MAP: Record<ContinuousScreeningBase['status'], TagProps['color']> = {
  in_review: 'orange',
  confirmed_hit: 'red',
  no_hit: 'green',
};

export function ReviewStatusBadge({ status }: { status: ContinuousScreeningBase['status'] }) {
  const { t } = useTranslation(['screenings']);
  return <Tag color={CONTINUOUS_SCREENING_STATUS_COLOR_MAP[status]}>{t(`screenings:status.${status}`)}</Tag>;
}
