import { Callout } from '@app-builder/components/Callout';
import type { ScreeningMatchComment, ScreeningMatchStatus } from '@app-builder/models/screening';
import {
  isPendingReviewItem,
  SCREENING_REVIEW_COMMENT_MAX,
  type ScreeningReviewDecision,
  type ScreeningReviewItem,
  type ScreeningReviewScreeningState,
} from '@app-builder/models/screening-review';
import { useCloseScreeningReviewCaseMutation } from '@app-builder/queries/cases/screening-review-close-case';
import { useLoadMoreContinuousScreeningMatchesMutation } from '@app-builder/queries/continuous-screening/load-more-matches';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import type { ScreeningReviewDecisionResult } from '@app-builder/services/screening-review-decision';
import { getFullName } from '@app-builder/services/user';
import { useFormatDateTime } from '@app-builder/utils/format';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@tanstack/react-router';
import { type Ref, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, cn, Tag, TextArea } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { useFlushPendingDecision, useOpenCaseInNewTab } from './pending-decision';
import { ShortcutButton } from './ShortcutButton';

export interface ScreeningReviewDraft {
  decision?: ScreeningReviewDecision;
  comment: string;
}

const DECISION_STYLES: Record<Exclude<ScreeningMatchStatus, 'pending'>, string> = {
  confirmed_hit: 'border-red-primary bg-red-primary text-grey-white',
  no_hit: 'border-green-hover bg-green-hover text-grey-white',
  skipped: 'border-grey-placeholder text-grey-placeholder',
};

export function DecisionTag({ status }: { status: ScreeningMatchStatus }) {
  const { t } = useTranslation(['cases']);
  if (status === 'pending') return null;
  return (
    <Tag size="xs" className={cn('h-5 shrink-0 gap-2xs px-sm', DECISION_STYLES[status])}>
      {t(`cases:screening_review.decision.${status}`)}
      {status !== 'skipped' ? <Icon icon="tick" aria-hidden className="size-3" /> : null}
    </Tag>
  );
}

/** The step of the hit and who acts on it. The second iteration adds the validation step. */
export function StepTag({ item, decidedThisVisit }: { item: ScreeningReviewItem; decidedThisVisit: boolean }) {
  const { t } = useTranslation(['cases']);
  const { currentUser } = useOrganizationDetails();
  const { getOrgUserById } = useOrganizationUsers();
  const you = t('cases:screening_review.step.you');
  if (isPendingReviewItem(item)) {
    return (
      <Tag color="purple" className="shrink-0">
        {t('cases:screening_review.step.to_review', { actor: you })}
      </Tag>
    );
  }
  // A pending hit of a closed screening has no step left.
  if (item.status === 'pending') return null;
  const currentUserId = currentUser.actorIdentity.userId;
  // A decision made this visit is missing from the snapshot until the next refetch.
  const reviewerId = decidedThisVisit ? currentUserId : item.reviewedBy;
  const reviewer = reviewerId ? getOrgUserById(reviewerId) : undefined;
  const actor = reviewerId && reviewerId === currentUserId ? you : reviewer ? getFullName(reviewer) : undefined;
  return (
    <Tag color="green" className="shrink-0">
      {actor
        ? t('cases:screening_review.step.validated', { actor })
        : t('cases:screening_review.step.validated_no_actor')}
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
    <Card
      as="section"
      aria-label={t('cases:screening_review.dock.title')}
      // Half the column at most: the body scrolls, so Validate and the comparison stay in view.
      className="flex max-h-[50%] min-h-0 shrink-0 flex-col gap-sm p-md"
    >
      <div className="flex min-h-0 flex-col gap-sm overflow-y-auto overscroll-y-contain">
        <HitComments comments={item.comments} />
        <div role="group" aria-label={t('cases:screening_review.dock.title')} className="flex flex-wrap gap-sm">
          {decisions.map(({ value, hotkey }) => {
            const selected = draft.decision === value;
            return (
              <ShortcutButton
                key={value}
                tone={selected ? `picked_${value === 'confirmed_hit' ? 'hit' : 'no_hit'}` : 'neutral'}
                hotkeys={[hotkey]}
                aria-pressed={selected}
                onClick={() => onDraftChange({ ...draft, decision: value })}
              >
                {t(`cases:screening_review.decision.${value}`)}
              </ShortcutButton>
            );
          })}
        </div>
        {draft.decision === 'confirmed_hit' && skippedCount > 0 ? (
          <Callout role="note" color="orange" icon="warning">
            {t('cases:screening_review.dock.skip_warning', { count: skippedCount })}
          </Callout>
        ) : null}
        <TextArea
          ref={commentRef}
          maxLength={SCREENING_REVIEW_COMMENT_MAX}
          aria-label={t('cases:screening_review.dock.comment')}
          placeholder={t('cases:screening_review.dock.comment')}
          value={draft.comment}
          // The field grows with its text, and scrolls past this height.
          className="max-h-40 [&_textarea]:overflow-y-auto"
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
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-sm">
        <ShortcutButton tone="ghost" hotkeys={['Escape']} onClick={onCancel}>
          {t('cases:screening_review.dock.cancel')}
        </ShortcutButton>
        <ShortcutButton tone="primary" hotkeys={['Enter']} disabled={!draft.decision} onClick={onSubmit}>
          {t('cases:screening_review.dock.validate')}
        </ShortcutButton>
      </div>
    </Card>
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
        if (!event.altKey && openCase(event.currentTarget.href)) event.preventDefault();
      }}
      onAuxClick={(event) => {
        if (event.button === 1 && !event.altKey && openCase(event.currentTarget.href)) event.preventDefault();
      }}
      className={cn('text-purple-primary underline', className)}
    >
      {t('cases:screening_review.open_case')}
    </Link>
  );
}

/** What the page does once a screening's next matches are loaded, or its case is closed. */
export interface ScreeningStateActions {
  onMatchesLoaded: () => Promise<unknown>;
  /** Close case is offered when this screening is the case's last open one and the user may dismiss it. */
  canCloseCase: (item: ScreeningReviewItem) => boolean;
  /** Called when Close case starts; the callback it returns receives the outcome. */
  onCaseClosed: (item: ScreeningReviewItem) => (result: ScreeningReviewDecisionResult | undefined) => void;
}

type ScreeningStateAction = 'load_more' | 'close_case';

function LoadMoreMatches({ item, actions }: { item: ScreeningReviewItem; actions: ScreeningStateActions }) {
  const { t } = useTranslation(['cases']);
  const loadMore = useLoadMoreContinuousScreeningMatchesMutation(item.screeningId);
  const closeCase = useCloseScreeningReviewCaseMutation();
  const flush = useFlushPendingDecision();
  // The action waiting for the decisions on screen to be written.
  const [flushingFor, setFlushingFor] = useState<ScreeningStateAction>();
  const running: ScreeningStateAction | undefined =
    flushingFor ?? (loadMore.isPending ? 'load_more' : closeCase.isPending ? 'close_case' : undefined);
  // A pending decision may be on this screening: write it before acting on the screening.
  const afterFlush = (action: ScreeningStateAction, then: () => void) => {
    setFlushingFor(action);
    void flush().then(() => {
      setFlushingFor(undefined);
      then();
    });
  };
  const spinner = <Icon icon="spinner" aria-hidden className="size-4 animate-spin" />;
  return (
    <>
      <Button
        variant="secondary"
        disabled={!!running}
        // The promise, unlike a per-call `onSuccess`, still settles once this dock unmounts.
        onClick={() =>
          afterFlush('load_more', () =>
            loadMore.mutateAsync().then(
              () => void actions.onMatchesLoaded(),
              () => undefined,
            ),
          )
        }
      >
        {running === 'load_more' ? spinner : null}
        {t('cases:screening_review.load_more')}
      </Button>
      {actions.canCloseCase(item) ? (
        <>
          <span>{t('cases:screening_review.or')}</span>
          <Button
            disabled={!!running}
            // Ends the screening at No hit without loading its other matches, which closes the case.
            onClick={() => {
              const onClosed = actions.onCaseClosed(item);
              afterFlush('close_case', () =>
                closeCase
                  .mutateAsync({ caseId: item.caseId, screeningId: item.screeningId })
                  .then(onClosed, () => undefined),
              );
            }}
          >
            {running === 'close_case' ? spinner : null}
            {t('cases:screening_review.close_case')}
          </Button>
        </>
      ) : null}
      {loadMore.isError ? (
        <p role="alert" className="text-s text-red-primary">
          {t('cases:screening_review.load_more_error')}
        </p>
      ) : null}
      {closeCase.isError ? (
        <p role="alert" className="text-s text-red-primary">
          {t('cases:screening_review.close_case_error')}
        </p>
      ) : null}
    </>
  );
}

/** What happens next for a screening: finish in the case, wait for closure, or load more matches. */
export function ScreeningStateNote({
  item,
  state,
  actions,
}: {
  item: ScreeningReviewItem;
  state: ScreeningReviewScreeningState;
  actions: ScreeningStateActions;
}) {
  const { t } = useTranslation(['cases']);
  if (state === 'in_review') return null;
  return (
    <div role="status" className="flex flex-wrap items-center gap-sm text-s">
      <span>{t(`cases:screening_review.screening_state.${state}`)}</span>
      {state === 'confirmed_hit' ? <OpenCaseLink caseId={item.caseId} /> : null}
      {state === 'load_more' ? <LoadMoreMatches item={item} actions={actions} /> : null}
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
  actions,
}: {
  item: ScreeningReviewItem;
  state: ScreeningReviewScreeningState;
  sessionComment?: string;
  canMoveNext: boolean;
  onNext: () => void;
  actions: ScreeningStateActions;
}) {
  const { t } = useTranslation(['cases']);
  return (
    <section
      aria-label={t('cases:screening_review.dock.title')}
      className="flex max-h-[50%] min-h-0 shrink-0 flex-col gap-sm rounded-lg border border-grey-border bg-grey-background-light p-md"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-sm">
        <span className="text-s font-medium">
          {item.status === 'pending'
            ? t('cases:screening_review.dock.not_reviewable')
            : t('cases:screening_review.dock.validated', {
                decision: t(`cases:screening_review.decision.${item.status}`),
              })}
        </span>
        <ShortcutButton tone="neutral" hotkeys={['J']} disabled={!canMoveNext} onClick={onNext}>
          {t('cases:screening_review.dock.next_hit')}
        </ShortcutButton>
      </div>
      <div className="flex min-h-0 flex-col gap-sm overflow-y-auto overscroll-y-contain empty:hidden">
        <ScreeningStateNote item={item} state={state} actions={actions} />
        <HitComments comments={item.comments} sessionComment={sessionComment} />
      </div>
    </section>
  );
}

/** No hit for every selected hit, with one comment recorded on each. */
export function BatchDock({
  count,
  comment,
  mixedComments,
  onCommentChange,
  onSubmit,
  onClear,
  commentRef,
}: {
  count: number;
  comment: string;
  /** The selected hits keep different comments: typing replaces them all. */
  mixedComments: boolean;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  commentRef: Ref<HTMLTextAreaElement>;
}) {
  const { t } = useTranslation(['cases']);
  return (
    <Card
      as="section"
      aria-label={t('cases:screening_review.dock.title')}
      className="flex shrink-0 flex-col gap-sm p-md"
    >
      <TextArea
        ref={commentRef}
        maxLength={SCREENING_REVIEW_COMMENT_MAX}
        aria-label={t('cases:screening_review.batch.comment')}
        placeholder={t(
          mixedComments ? 'cases:screening_review.batch.mixed_comments' : 'cases:screening_review.batch.comment',
        )}
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
        <ShortcutButton tone="ghost" hotkeys={['Escape']} onClick={onClear}>
          {t('cases:screening_review.batch.clear')}
        </ShortcutButton>
        <ShortcutButton tone="primary" hotkeys={['Enter']} onClick={onSubmit}>
          {t('cases:screening_review.batch.no_hit', { count })}
        </ShortcutButton>
      </div>
    </Card>
  );
}
