import { type ReviewStatus } from '@app-builder/models/decision';
import { type Outcome as TOutcome } from '@app-builder/models/outcome';
import clsx from 'clsx';
import * as React from 'react';
import * as R from 'remeda';

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
  if (
    outcome !== 'block_and_review' ||
    reviewStatus === undefined ||
    reviewStatus === 'pending'
  ) {
    return (
      <OutcomeTag
        border="square"
        size="big"
        outcome={outcome}
        className={className}
      />
    );
  }

  return (
    <div className={clsx('relative flex flex-col gap-2', className)}>
      <OutcomeTag
        className="opacity-20"
        border="square"
        size="big"
        outcome={outcome}
      />
      <svg
        className="text-grey-25 absolute -left-4 h-full w-4"
        viewBox="0 0 16 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 16 18 h-2 q -6 0 -6 6 v 26 q0 6 6 6 h2 l-3 3 l3 -3 l-3 -3 l3 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <ReviewStatusTag border="square" size="big" reviewStatus={reviewStatus} />
    </div>
  );
}
