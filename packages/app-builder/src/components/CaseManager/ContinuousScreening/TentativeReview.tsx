import { Callout } from '@app-builder/components/Callout';
import {
  type ContinuousScreening,
  type ContinuousScreeningMatch,
  getPendingTentativeReviews,
} from '@app-builder/models/continuous-screening';
import {
  type ScreeningMatchTentativeReview,
  type ScreeningMatchTentativeReviewStatus,
} from '@app-builder/models/screening';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { cn, Tag, type TagProps } from 'ui-design-system';

export function matchCardElementId(matchId: string) {
  return `screening-match-${matchId}`;
}

export function TentativeReviewTag({
  status,
  size,
  className,
}: {
  status: ScreeningMatchTentativeReviewStatus;
  size?: TagProps['size'];
  className?: string;
}) {
  const { t } = useTranslation(['cases']);
  return (
    <Tag color="yellow" size={size} className={cn('shrink-0', className)}>
      {t(`cases:tentative_review.tag.${status}`)}
    </Tag>
  );
}

function TentativeReviewAuthor({ review }: { review: ScreeningMatchTentativeReview }) {
  const formatDateTime = useFormatDateTime();
  const { getOrgUserById } = useOrganizationUsers();
  return (
    <>
      <span>{getFullName(getOrgUserById(review.authorId))}</span>
      <time className="text-grey-secondary" dateTime={review.createdAt}>
        {formatDateTime(review.createdAt, { dateStyle: 'short', timeStyle: 'short' })}
      </time>
    </>
  );
}

/** Lists the tentative reviews of a screening's pending hits, each linking to its match card. */
export function TentativeReviewsCallout({
  screening,
  className,
}: {
  screening: ContinuousScreening;
  className?: string;
}) {
  const { t } = useTranslation(['cases']);
  const pendingReviews = getPendingTentativeReviews(screening.matches);

  if (pendingReviews.length === 0) return null;

  return (
    <Callout
      role="note"
      color="yellow"
      icon="warning"
      iconColor="yellow"
      className={cn('bg-yellow-background-light [&>div:last-child]:items-start', className)}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-sm">
        <span className="font-medium">
          {t('cases:tentative_review.callout_title', { count: pendingReviews.length })}
        </span>
        <ul className="flex flex-col gap-sm">
          {pendingReviews.map(({ match, review }) => (
            <li key={review.id}>
              <TentativeReviewRow match={match} review={review} />
            </li>
          ))}
        </ul>
      </div>
    </Callout>
  );
}

function TentativeReviewRow({
  match,
  review,
}: {
  match: ContinuousScreeningMatch;
  review: ScreeningMatchTentativeReview;
}) {
  return (
    <button
      type="button"
      className="hover:bg-yellow-background flex w-full flex-col gap-xs rounded-sm p-xs text-start"
      onClick={() =>
        document.getElementById(matchCardElementId(match.id))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    >
      <span className="flex flex-wrap items-center gap-xs text-xs">
        <span className="font-medium text-s underline decoration-dotted underline-offset-2">
          {match.payload.caption}
        </span>
        <span aria-hidden>·</span>
        <TentativeReviewTag status={review.status} size="xs" />
        <span aria-hidden>·</span>
        <TentativeReviewAuthor review={review} />
      </span>
      <span className="whitespace-pre-wrap text-xs text-grey-primary">{review.comment}</span>
    </button>
  );
}

/** The active tentative review of a hit, shown to the reviewer who confirms it. */
export function TentativeReviewSummary({ review }: { review: ScreeningMatchTentativeReview }) {
  const { t } = useTranslation(['cases']);
  return (
    <div className="border-yellow-border bg-yellow-background-light flex flex-col gap-xs rounded-sm border p-sm">
      <span className="flex flex-wrap items-center gap-xs text-xs">
        <span className="font-medium">{t('cases:tentative_review.title')}</span>
        <TentativeReviewTag status={review.status} size="xs" />
        <TentativeReviewAuthor review={review} />
      </span>
      <p className="whitespace-pre-wrap text-xs">{review.comment}</p>
    </div>
  );
}
