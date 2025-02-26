import { type ReviewStatus } from '@app-builder/models/decision';
import { type Outcome as TOutcome } from '@app-builder/models/outcome';
import clsx from 'clsx';
import * as React from 'react';
import * as R from 'remeda';
import { Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { OutcomeTag, useOutcomes } from './OutcomeTag';
import { ReviewStatusTag, useReviewStatuses } from './ReviewStatusTag';

export function useOutcomeAndReviewStatus() {
  const outcomes = useOutcomes();
  const reviewStatuses = useReviewStatuses();

  return React.useMemo(
    () =>
      R.pipe(
        outcomes,
        R.map((outcome) => {
          if (outcome.value === 'block_and_review') {
            const t = reviewStatuses.map((reviewStatus) => ({
              outcomeValue: 'block_and_review' as const,
              outcomeLabel: outcome.label,
              reviewStatusValue: reviewStatus.value,
              reviewStatusLabel: reviewStatus.label,
            }));
            return t;
          }
          return {
            outcomeValue: outcome.value,
            outcomeLabel: outcome.label,
            reviewStatusValue: undefined,
            reviewStatusLabel: undefined,
          };
        }),
        R.flat(),
      ),
    [outcomes, reviewStatuses],
  );
}

export function OutcomeAndReviewStatus({
  className,
  outcome,
  reviewStatus,
}: {
  className?: string;
  outcome: TOutcome;
  reviewStatus?: ReviewStatus;
}) {
  if (outcome !== 'block_and_review' || reviewStatus === undefined || reviewStatus === 'pending') {
    return <OutcomeTag border="square" size="big" outcome={outcome} className={className} />;
  }

  return (
    <div className={clsx('relative flex flex-row gap-2', className)}>
      <Tooltip.Default
        content={<OutcomeTag border="square" size="big" outcome="block_and_review" />}
      >
        <div className="bg-orange-95 flex size-8 shrink-0 items-center justify-center rounded">
          <Icon icon="policy" className="size-6 text-orange-50" />
        </div>
      </Tooltip.Default>
      <span className="text-s text-grey-80 self-center font-semibold">→</span>
      <ReviewStatusTag border="square" size="big" reviewStatus={reviewStatus} className="w-full" />
    </div>
  );
}
