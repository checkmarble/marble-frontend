import {
  type ReviewStatus,
  reviewStatuses,
} from '@app-builder/models/decision';
import { type ParseKeys } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, type TagProps } from 'ui-design-system';

import { decisionsI18n } from './decisions-i18n';

export interface OutcomeProps extends Omit<TagProps, 'color'> {
  reviewStatus: ReviewStatus;
  disabled?: boolean;
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

export function useReviewStatuses() {
  const { t } = useTranslation(decisionsI18n);

  return React.useMemo(
    () =>
      reviewStatuses.map((reviewStatus) => ({
        value: reviewStatus,
        label: t(reviewStatusMapping[reviewStatus].tKey),
      })),
    [t],
  );
}

export function ReviewStatusTag({
  reviewStatus,
  disabled,
  ...tagProps
}: OutcomeProps) {
  const { t } = useTranslation(decisionsI18n);

  const { color, tKey } = reviewStatusMapping[reviewStatus];

  return (
    <Tag {...tagProps} color={disabled ? 'grey' : color}>
      <span className="text-center capitalize">{t(tKey)}</span>
    </Tag>
  );
}
