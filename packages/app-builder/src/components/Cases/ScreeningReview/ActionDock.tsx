import { CalloutV2 } from '@app-builder/components/Callout';
import type { ScreeningMatchComment, ScreeningMatchStatus } from '@app-builder/models/screening';
import type {
  ScreeningReviewDecision,
  ScreeningReviewItem,
  ScreeningReviewScreeningState,
} from '@app-builder/models/screening-review';
import { useLoadMoreContinuousScreeningMatchesMutation } from '@app-builder/queries/continuous-screening/load-more-matches';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { useFormatDateTime } from '@app-builder/utils/format';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@tanstack/react-router';
import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Tag, type TagProps, TextArea } from 'ui-design-system';
import { useFlushPendingDecision, useOpenCaseInNewTab } from './pending-decision';
import { ShortcutKeys } from './ShortcutHelp';

export interface ScreeningReviewDraft {
  decision?: ScreeningReviewDecision;
  comment: string;
}

const DECISION_COLORS: Record<Exclude<ScreeningMatchStatus, 'pending'>, TagProps['color']> = {
  confirmed_hit: 'red',
  no_hit: 'green',
  skipped: 'grey',
};

export function DecisionTag({ status }: { status: ScreeningMatchStatus }) {
  const { t } = useTranslation(['cases']);
  if (status === 'pending') return null;
  return (
    <Tag size="xs" color={DECISION_COLORS[status]} className="h-5 shrink-0 px-sm">
      {t(`cases:screening_review.decision.${status}`)}
    </Tag>
  );
}

/** The review step. The second iteration adds validation steps beside these. */
export function StepTag({ pending }: { pending: boolean }) {
  const { t } = useTranslation(['cases']);
  return (
    <Tag size="xs" color={pending ? 'orange' : 'grey'} className="h-5 shrink-0 px-sm">
      {t(pending ? 'cases:screening_review.step.to_review' : 'cases:screening_review.step.validated')}
    </Tag>
  );
}

function HitComments({ comments, sessionComment }: { comments: ScreeningMatchComment[]; sessionComment?: string }) {
  const { t } = useTranslation(['cases']);
  const { getOrgUserById } = useOrganizationUsers();
  const formatDateTime = useFormatDateTime();
  // The comment written this visit is missing from the snapshot until the next refetch.
  const pendingComment =
    sessionComment?.trim() && !comments.some(({ comment }) => comment === sessionComment.trim())
      ? sessionComment.trim()
      : undefined;
  if (!comments.length && !pendingComment) return null;
  return (
    <section aria-label={t('cases:screening_review.comments')} className="flex flex-col gap-xs">
      <span className="text-xs text-grey-secondary">{t('cases:screening_review.comments')}</span>
      <ul className="flex flex-col gap-xs">
        {comments.map((comment) => {
          const author = getOrgUserById(comment.authorId);
          return (
            <li key={comment.id} className="flex flex-col rounded-md bg-grey-background-light px-sm py-xs text-s">
              <span className="text-2xs text-grey-secondary">
                {author ? `${getFullName(author)} · ` : ''}
                {formatDateTime(comment.createdAt, { dateStyle: 'short', timeStyle: 'short' })}
              </span>
              <span className="whitespace-pre-wrap">{comment.comment}</span>
            </li>
          );
        })}
        {pendingComment ? (
          <li className="rounded-md bg-grey-background-light px-sm py-xs text-s whitespace-pre-wrap">
            {pendingComment}
          </li>
        ) : null}
      </ul>
    </section>
  );
}

interface ActionDockProps {
  item: ScreeningReviewItem;
  draft: ScreeningReviewDraft;
  onDraftChange: (draft: ScreeningReviewDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
  /** Pending hits that a Hit skips, on a customer-triggered screening. */
  skippedCount: number;
  commentRef: Ref<HTMLTextAreaElement>;
}

/** Hit or No hit, an optional comment, then Validate. Room is left for more actions later. */
export function ActionDock({
  item,
  draft,
  onDraftChange,
  onSubmit,
  onCancel,
  skippedCount,
  commentRef,
}: ActionDockProps) {
  const { t } = useTranslation(['cases']);
  const decisions = [
    { value: 'confirmed_hit', hotkey: 'M' },
    { value: 'no_hit', hotkey: 'N' },
  ] as const;
  return (
    <section
      aria-label={t('cases:screening_review.dock.title')}
      className="flex shrink-0 flex-col gap-sm rounded-lg border border-grey-border bg-surface-card p-md"
    >
      <HitComments comments={item.comments} />
      <div role="group" aria-label={t('cases:screening_review.dock.title')} className="flex flex-wrap gap-sm">
        {decisions.map(({ value, hotkey }) => {
          const selected = draft.decision === value;
          return (
            <Button
              key={value}
              variant="secondary"
              aria-pressed={selected}
              onClick={() => onDraftChange({ ...draft, decision: value })}
              className={cn(
                selected && value === 'confirmed_hit' && 'border-red-primary text-red-primary',
                selected && value === 'no_hit' && 'border-green-primary text-green-primary',
              )}
            >
              {t(`cases:screening_review.decision.${value}`)}
              <ShortcutKeys hotkeys={[hotkey]} variant="small" />
            </Button>
          );
        })}
      </div>
      {draft.decision === 'confirmed_hit' && skippedCount > 0 ? (
        <CalloutV2 role="note">{t('cases:screening_review.dock.skip_warning', { count: skippedCount })}</CalloutV2>
      ) : null}
      <TextArea
        ref={commentRef}
        aria-label={t('cases:screening_review.dock.comment')}
        placeholder={t('cases:screening_review.dock.comment')}
        value={draft.comment}
        onChange={(event) => onDraftChange({ ...draft, comment: event.target.value })}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          } else if (event.key === 'Escape') {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
      />
      <div className="flex flex-wrap items-center justify-end gap-sm">
        <Button variant="secondary" onClick={onCancel}>
          {t('cases:screening_review.dock.cancel')}
        </Button>
        <Button variant="primary" disabled={!draft.decision} onClick={onSubmit}>
          {t('cases:screening_review.dock.validate')}
          <ShortcutKeys hotkeys={['Enter']} variant="small" />
        </Button>
      </div>
    </section>
  );
}

export function OpenCaseLink({ caseId, className }: { caseId: string; className?: string }) {
  const { t } = useTranslation(['cases']);
  const openCase = useOpenCaseInNewTab();
  return (
    <Link
      to="/cases/m/$caseId"
      params={{ caseId: fromUUIDtoSUUID(caseId) }}
      target="_blank"
      rel="noopener"
      onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (openCase(event.currentTarget.href)) event.preventDefault();
      }}
      className={cn('text-purple-primary underline', className)}
    >
      {t('cases:screening_review.open_case')}
    </Link>
  );
}

function LoadMoreMatches({ screeningId, onLoaded }: { screeningId: string; onLoaded: () => Promise<unknown> }) {
  const { t } = useTranslation(['cases']);
  const loadMore = useLoadMoreContinuousScreeningMatchesMutation(screeningId);
  const flush = useFlushPendingDecision();
  return (
    <>
      <Button
        variant="secondary"
        disabled={loadMore.isPending}
        // A pending decision may be on this screening: write it before loading more matches.
        onClick={() => void flush().then(() => loadMore.mutate(undefined, { onSuccess: () => void onLoaded() }))}
      >
        {t('cases:screening_review.load_more')}
      </Button>
      {loadMore.isError ? (
        <p role="alert" className="text-s text-red-primary">
          {t('cases:screening_review.load_more_error')}
        </p>
      ) : null}
    </>
  );
}

/** What happens next for a screening: finish in the case, wait for closure, or load more matches. */
export function ScreeningStateNote({
  item,
  state,
  onMatchesLoaded,
}: {
  item: ScreeningReviewItem;
  state: ScreeningReviewScreeningState;
  onMatchesLoaded: () => Promise<unknown>;
}) {
  const { t } = useTranslation(['cases']);
  if (state === 'in_review') return null;
  return (
    <div role="status" className="flex flex-wrap items-center gap-sm text-s">
      <span>{t(`cases:screening_review.screening_state.${state}`)}</span>
      {state === 'confirmed_hit' ? <OpenCaseLink caseId={item.caseId} /> : null}
      {state === 'load_more' ? <LoadMoreMatches screeningId={item.screeningId} onLoaded={onMatchesLoaded} /> : null}
    </div>
  );
}

/** A decided hit can't be changed here. The case page keeps its reopen path. */
export function ReadOnlyDock({
  item,
  state,
  sessionComment,
  canMoveNext,
  onNext,
  onMatchesLoaded,
}: {
  item: ScreeningReviewItem;
  state: ScreeningReviewScreeningState;
  sessionComment?: string;
  canMoveNext: boolean;
  onNext: () => void;
  onMatchesLoaded: () => Promise<unknown>;
}) {
  const { t } = useTranslation(['cases']);
  return (
    <section
      aria-label={t('cases:screening_review.dock.title')}
      className="flex shrink-0 flex-col gap-sm rounded-lg border border-grey-border bg-grey-background-light p-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-sm">
        <span className="text-s font-medium">
          {item.status === 'pending'
            ? t('cases:screening_review.dock.not_reviewable')
            : t('cases:screening_review.dock.validated', {
                decision: t(`cases:screening_review.decision.${item.status}`),
              })}
        </span>
        <Button variant="secondary" disabled={!canMoveNext} onClick={onNext}>
          {t('cases:screening_review.dock.next_hit')}
          <ShortcutKeys hotkeys={['J']} variant="small" />
        </Button>
      </div>
      <ScreeningStateNote item={item} state={state} onMatchesLoaded={onMatchesLoaded} />
      <HitComments comments={item.comments} sessionComment={sessionComment} />
    </section>
  );
}

/** No hit for every selected hit, with one comment recorded on each. */
export function BatchDock({
  count,
  comment,
  onCommentChange,
  onSubmit,
  onClear,
  commentRef,
}: {
  count: number;
  comment: string;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  commentRef: Ref<HTMLTextAreaElement>;
}) {
  const { t } = useTranslation(['cases']);
  return (
    <section
      aria-label={t('cases:screening_review.dock.title')}
      className="flex shrink-0 flex-col gap-sm rounded-lg border border-grey-border bg-surface-card p-md"
    >
      <TextArea
        ref={commentRef}
        aria-label={t('cases:screening_review.batch.comment')}
        placeholder={t('cases:screening_review.batch.comment')}
        value={comment}
        onChange={(event) => onCommentChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          } else if (event.key === 'Escape') {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
      />
      <div className="flex flex-wrap items-center justify-end gap-sm">
        <Button variant="secondary" onClick={onClear}>
          {t('cases:screening_review.batch.clear')}
          <ShortcutKeys hotkeys={['Escape']} variant="small" />
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          {t('cases:screening_review.batch.no_hit', { count })}
          <ShortcutKeys hotkeys={['Enter']} variant="small" />
        </Button>
      </div>
    </section>
  );
}
