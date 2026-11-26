import { Callout } from '@app-builder/components/Callout';
import {
  TentativeReviewSummary,
  TentativeReviewTag,
} from '@app-builder/components/CaseManager/ContinuousScreening/TentativeReview';
import type { ScreeningMatchComment, ScreeningMatchStatus } from '@app-builder/models/screening';
import {
  awaitsEscalation,
  isPendingReviewItem,
  SCREENING_REVIEW_COMMENT_MAX,
  type ScreeningReviewDecision,
  type ScreeningReviewItem,
  type ScreeningReviewScreeningState,
} from '@app-builder/models/screening-review';
import { useCloseScreeningReviewCaseMutation } from '@app-builder/queries/cases/screening-review-close-case';
import { useEscalateScreeningReviewCaseMutation } from '@app-builder/queries/cases/screening-review-escalate-case';
import { useLoadMoreContinuousScreeningMatchesMutation } from '@app-builder/queries/continuous-screening/load-more-matches';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import type {
  ScreeningReviewDecisionResult,
  ScreeningReviewEscalateResult,
} from '@app-builder/services/screening-review-decision';
import { getFullName } from '@app-builder/services/user';
import { useFormatDateTime } from '@app-builder/utils/format';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@tanstack/react-router';
import { type Ref, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, cn, Tag, TextArea } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { EscalationTooltip, type ScreeningReviewEscalationTarget } from './EscalationTooltip';
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
  const currentUserId = currentUser.actorIdentity.userId;
  const actorName = (userId: string | undefined) => {
    if (userId && userId === currentUserId) return you;
    const user = userId ? getOrgUserById(userId) : undefined;
    return user ? getFullName(user) : undefined;
  };
  if (awaitsEscalation(item)) {
    const actor = actorName(item.tentativeReview?.authorId);
    return (
      <Tag color="yellow" className="shrink-0">
        {actor
          ? t('cases:screening_review.step.tentative', { actor })
          : t('cases:screening_review.step.tentative_no_actor')}
      </Tag>
    );
  }
  if (isPendingReviewItem(item)) {
    return (
      <Tag color="purple" className="shrink-0">
        {t('cases:screening_review.step.to_review', { actor: you })}
      </Tag>
    );
  }
  // A pending hit of a closed screening has no step left.
  if (item.status === 'pending') return null;
  // A decision made this visit is missing from the snapshot until the next refetch.
  const actor = actorName(decidedThisVisit ? currentUserId : item.reviewedBy);
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
                {formatDateTime(comment.createdAt, { dateStyle: 'short', timeStyle: 'short', fullYear: true })}
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

export function HitTentativeTag({ item }: { item: ScreeningReviewItem }) {
  return item.tentativeReview ? <TentativeReviewTag status={item.tentativeReview.status} /> : null;
}

export function canRequestConfirmation(draft: ScreeningReviewDraft, target: ScreeningReviewEscalationTarget) {
  return !!draft.decision && !!draft.comment.trim() && !!target.escalationInboxName;
}

interface ActionDockProps {
  item: ScreeningReviewItem;
  draft: ScreeningReviewDraft;
  onDraftChange: (draft: ScreeningReviewDraft) => void;
  onSubmit: () => void;
  onRequestConfirmation: () => void;
  escalationTarget: ScreeningReviewEscalationTarget;
  onCancel: () => void;
  skippedCount: number;
  commentRef: Ref<HTMLTextAreaElement>;
}

/**
 * Hit or No hit, a comment, then Validate, or Request confirmation for a tentative review. The
 * hit's own tentative review shows first, and never fills the draft.
 */
export function ActionDock({
  item,
  draft,
  onDraftChange,
  onSubmit,
  onRequestConfirmation,
  escalationTarget,
  onCancel,
  skippedCount,
  commentRef,
}: ActionDockProps) {
  const { t } = useTranslation(['cases']);
  const confirmationRequestable = canRequestConfirmation(draft, escalationTarget);
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
        {item.tentativeReview ? <TentativeReviewSummary review={item.tentativeReview} /> : null}
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
          <ShortcutButton tone="ghost" hotkeys={['C']} disabled={!draft.decision}>
            {t('cases:screening_review.shortcuts.comment')}
          </ShortcutButton>
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
          // The comment goes with a decision, so it waits for one.
          disabled={!draft.decision}
          placeholder={t(
            draft.decision ? 'cases:screening_review.dock.comment' : 'cases:screening_review.dock.comment_disabled',
          )}
          value={draft.comment}
          // The field grows with its text, and scrolls past this height.
          className="max-h-40 [&_textarea]:overflow-y-auto"
          onChange={(event) => onDraftChange({ ...draft, comment: event.target.value })}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSubmit();
            } else if (event.key === 'Enter' && confirmationRequestable) {
              // Shift+Enter breaks the line only while a confirmation can't be requested.
              event.preventDefault();
              onRequestConfirmation();
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
        <EscalationTooltip
          target={escalationTarget}
          fallback={confirmationRequestable ? undefined : t('cases:screening_review.dock.request_confirmation_hint')}
        >
          <ShortcutButton
            tone="neutral"
            hotkeys={['Shift+Enter']}
            aria-keyshortcuts="Shift+Enter"
            disabled={!confirmationRequestable}
            onClick={onRequestConfirmation}
          >
            {t('cases:screening_review.dock.request_confirmation')}
          </ShortcutButton>
        </EscalationTooltip>
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
  escalationTarget: (item: ScreeningReviewItem) => ScreeningReviewEscalationTarget;
  /** Escalate replaces Close case once the case has a tentative review and nothing left to review. */
  canEscalateCase: (item: ScreeningReviewItem) => boolean;
  /** Called when Escalate starts; the callback it returns receives the outcome. */
  onCaseEscalated: (item: ScreeningReviewItem) => (result: ScreeningReviewEscalateResult | undefined) => void;
}

type ScreeningStateAction = 'load_more' | 'close_case' | 'escalate';

/** Load more, unless `loadable` is false, then Escalate or Close case when the case allows it. */
function ScreeningActions({
  item,
  actions,
  loadable,
}: {
  item: ScreeningReviewItem;
  actions: ScreeningStateActions;
  loadable: boolean;
}) {
  const { t } = useTranslation(['cases']);
  const loadMore = useLoadMoreContinuousScreeningMatchesMutation(item.screeningId);
  const closeCase = useCloseScreeningReviewCaseMutation();
  const escalateCase = useEscalateScreeningReviewCaseMutation();
  const flush = useFlushPendingDecision();
  // The action waiting for the decisions on screen to be written.
  const [flushingFor, setFlushingFor] = useState<ScreeningStateAction>();
  const running: ScreeningStateAction | undefined =
    flushingFor ??
    (loadMore.isPending
      ? 'load_more'
      : closeCase.isPending
        ? 'close_case'
        : escalateCase.isPending
          ? 'escalate'
          : undefined);
  const escalationTarget = actions.escalationTarget(item);
  // A pending decision may be on this screening: write it before acting on the screening.
  const afterFlush = (action: ScreeningStateAction, then: () => void) => {
    setFlushingFor(action);
    void flush().then(() => {
      setFlushingFor(undefined);
      then();
    });
  };
  const spinner = <Icon icon="spinner" aria-hidden className="size-4 animate-spin" />;
  const or = loadable ? <span>{t('cases:screening_review.or')}</span> : null;
  return (
    <>
      {loadable ? (
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
      ) : null}
      {actions.canEscalateCase(item) ? (
        <>
          {or}
          <EscalationTooltip target={escalationTarget}>
            <Button
              disabled={!!running || !escalationTarget.escalationInboxName}
              // Escalates without dismissing the matches still to load, which stay pending.
              onClick={() => {
                const onEscalated = actions.onCaseEscalated(item);
                afterFlush('escalate', () =>
                  escalateCase.mutateAsync({ caseId: item.caseId }).then(onEscalated, () => undefined),
                );
              }}
            >
              {running === 'escalate' ? spinner : null}
              {escalationTarget.escalationInboxName
                ? t('cases:screening_review.escalate_case', { inbox: escalationTarget.escalationInboxName })
                : t('cases:screening_review.escalate_case_no_inbox')}
            </Button>
          </EscalationTooltip>
        </>
      ) : loadable && actions.canCloseCase(item) ? (
        <>
          {or}
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
      {escalateCase.isError ? (
        <p role="alert" className="text-s text-red-primary">
          {t('cases:screening_review.escalation.manual_failed')}
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
      <span>
        {t(`cases:screening_review.screening_state.${state}`, {
          inbox: actions.escalationTarget(item).escalationInboxName,
        })}
      </span>
      {state === 'confirmed_hit' ? <OpenCaseLink caseId={item.caseId} /> : null}
      {state === 'load_more' || state === 'escalation_pending' ? (
        <ScreeningActions item={item} actions={actions} loadable={state === 'load_more'} />
      ) : null}
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
          {awaitsEscalation(item)
            ? t('cases:screening_review.dock.tentative_submitted')
            : item.status === 'pending'
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
        {awaitsEscalation(item) && state === 'in_review' ? (
          <p className="text-s">{t('cases:screening_review.dock.escalates_when_reviewed')}</p>
        ) : null}
        {item.tentativeReview ? <TentativeReviewSummary review={item.tentativeReview} /> : null}
        <HitComments comments={item.comments} sessionComment={sessionComment} />
      </div>
    </section>
  );
}

/** No hit for every selected hit, with one comment recorded on each. No hit is the only batch decision. */
export function BatchDock({
  comment,
  mixedComments,
  onCommentChange,
  onSubmit,
  onClear,
  commentRef,
}: {
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
      <div role="group" aria-label={t('cases:screening_review.dock.title')} className="flex flex-wrap gap-sm">
        {/* Already chosen, as the single dock shows a picked decision, so Validate reads as No hit. */}
        <ShortcutButton tone="picked_no_hit" hotkeys={['N']} aria-pressed>
          {t('cases:screening_review.decision.no_hit')}
        </ShortcutButton>
      </div>
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
          {t('cases:screening_review.dock.validate')}
        </ShortcutButton>
      </div>
    </Card>
  );
}
