import { type ReviewStatus } from '@app-builder/models/decision';
import { type ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Tag, type TagProps } from 'ui-design-system';

import { decisionsI18n } from './decisions-i18n';

export interface OutcomeProps extends Omit<TagProps, 'color'> {
  reviewStatus: ReviewStatus;
}

const reviewStatusMapping: Record<
  ReviewStatus,
  { color: TagProps['color']; tKey: ParseKeys<['decisions']> }
> = {
  pending: {
    color: 'orange',
    tKey: 'decisions:review_status.pending',
  },
  approve: { color: 'green', tKey: 'decisions:review_status.approve' },
  decline: { color: 'red', tKey: 'decisions:review_status.decline' },
};

export function ReviewStatusTag({ reviewStatus, ...tagProps }: OutcomeProps) {
  const { t } = useTranslation(decisionsI18n);

  const { color, tKey } = reviewStatusMapping[reviewStatus];

  return (
    <Tag {...tagProps} color={color}>
      {t(tKey)}
    </Tag>
  );
}
