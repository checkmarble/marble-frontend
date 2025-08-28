import { AddComment } from '@app-builder/components/Cases/AddComment';
import { CloseCase } from '@app-builder/components/Cases/CloseCase';
import { OpenCase } from '@app-builder/components/Cases/OpenCase';
import useIntersection from '@app-builder/hooks/useIntersection';
import { type CurrentUser } from '@app-builder/models';
import { CaseReview } from '@app-builder/models/cases';
import { useAddReviewToCaseCommentsMutation } from '@app-builder/queries/add-review-to-case-comments';
import { useCaseReviewFeedbackMutation } from '@app-builder/queries/case-review-feedback';
import { type loader } from '@app-builder/routes/_builder+/cases+/$caseId+/_index';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { cva } from 'class-variance-authority';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, cn, Markdown } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CaseAlerts } from './CaseAlerts';
import { CaseEvents } from './CaseEvents';
import { CaseFile } from './CaseFile';
import { CaseStatusBadge } from './CaseStatus';
import { EditCaseAssignee } from './EditAssignee';
import { EditCaseInbox } from './EditCaseInbox';
import { EditCaseName } from './EditCaseName';
import { EditCaseSuspicion } from './EditCaseSuspicion';
import { EditCaseTags } from './EditTags';
import { EscalateCase } from './EscalateCase';
import { SnoozeCase } from './SnoozeCase';

const tabCva = cva('px-4 py-2 border-b -mb-px flex items-center gap-2 transition-colors', {
  variants: {
    selected: {
      true: ' border-purple-65 text-purple-65 cursor-default',
      false: 'border-transparent cursor-pointer',
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export const CaseDetails = ({
  currentUser,
  selectDecision,
  drawerContentMode,
  setDrawerContentMode,
  caseReview,
}: {
  currentUser: CurrentUser;
  selectDecision: (id: string) => void;
  drawerContentMode: 'pivot' | 'decision' | 'snooze';
  setDrawerContentMode: (mode: 'pivot' | 'decision' | 'snooze') => void;
  caseReview: CaseReview | null;
}) => {
  const { case: detail, inboxes, reports } = useLoaderData<typeof loader>();
  const { t } = useTranslation(['common', 'cases']);
  const language = useFormatLanguage();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(sentinelRef, {
    root: containerRef.current,
    threshold: 1,
  });
  const reviewReactionMutation = useCaseReviewFeedbackMutation(detail.id, caseReview?.id);
  const addReviewToCaseCommentsMutation = useAddReviewToCaseCommentsMutation(
    detail.id,
    caseReview?.id,
  );

  const [selectedTab, setSelectedTab] = useState<'caseDetails' | 'review'>('caseDetails');
  const revalidator = useRevalidator();
  const handleReviewReaction = (reaction: 'ok' | 'ko') => {
    reviewReactionMutation.mutateAsync(reaction).then(() => revalidator.revalidate());
  };
  const handleAddCommentReview = () => {
    addReviewToCaseCommentsMutation.mutateAsync().then(() => revalidator.revalidate());
  };

  return (
    <div
      ref={containerRef}
      className="relative flex w-full min-w-0 flex-col gap-v2-lg overflow-y-scroll bg-white pb-v2-lg"
    >
      <div ref={sentinelRef} className="absolute left-0 top-0" />
      <div
        className={cn('bg-inherit sticky top-0 z-10 flex flex-col gap-4 px-v2-lg pt-v2-lg', {
          'border-b-grey-90 border-b': !intersection?.isIntersecting,
        })}
      >
        <div className="flex shrink-0 justify-between gap-v2-xs">
          <EditCaseName name={detail.name} id={detail.id} />
          <div className="flex shrink-0 items-center gap-2">
            {detail.status !== 'closed' ? (
              <EscalateCase id={detail.id} inboxId={detail.inboxId} />
            ) : null}
            <SnoozeCase caseId={detail.id} snoozeUntil={detail.snoozedUntil} />
            {detail.status !== 'closed' ? (
              <CloseCase id={detail.id} />
            ) : (
              <OpenCase id={detail.id} />
            )}
          </div>
        </div>

        {caseReview ? (
          <div
            className={cn('flex border-b border-grey-90', {
              'border-transparent': !intersection?.isIntersecting,
            })}
          >
            <button
              className={tabCva({ selected: selectedTab === 'caseDetails' })}
              onClick={() => setSelectedTab('caseDetails')}
            >
              {t('cases:case_detail.tab.principal')}
            </button>
            <button
              className={tabCva({ selected: selectedTab === 'review' })}
              onClick={() => setSelectedTab('review')}
            >
              <div
                className={cn('size-5 rounded-md text-grey-0 p-0.5', {
                  'bg-purple-65 text-grey-100': selectedTab === 'review',
                })}
              >
                <Icon icon="ai-review" className="size-4" />
              </div>
              {t('cases:case_detail.tab.ai_review')}
            </button>
          </div>
        ) : null}
      </div>

      <div className="px-v2-lg flex flex-col gap-v2-lg">
        {selectedTab === 'caseDetails' ? (
          <>
            {/* Case details */}
            <div className="border-grey-90 text-small flex flex-col gap-2 border p-v2-md bg-grey-background-light rounded-v2-lg">
              <div className="grid grid-cols-[170px_1fr] items-center">
                <span className="text-grey-50 font-normal">{t('cases:case.status')}</span>
                <span className="flex items-center gap-2">
                  <CaseStatusBadge status={detail.status} outcome={detail.outcome} />
                  {detail.snoozedUntil ? (
                    <span className="font-medium text-grey-00">
                      {t('cases:case.snoozed_until', {
                        date: formatDateTimeWithoutPresets(detail.snoozedUntil, {
                          language,
                          dateStyle: 'short',
                        }),
                      })}
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="grid grid-cols-[170px_1fr] items-center">
                <span className="text-grey-50 font-normal">{t('cases:creation_date')}</span>
                <time className="font-medium" dateTime={detail.createdAt}>
                  {formatDateTimeWithoutPresets(detail.createdAt, {
                    language,
                    dateStyle: 'short',
                  })}
                </time>
              </div>
              <div className="grid grid-cols-[170px_1fr] items-center">
                <span className="text-grey-50 font-normal">{t('cases:case.inbox')}</span>
                <EditCaseInbox id={detail.id} inboxId={detail.inboxId} inboxes={inboxes} />
              </div>
              <div className="grid grid-cols-[170px_1fr] items-center">
                <span className="text-grey-50 font-normal">{t('cases:case.tags')}</span>
                <EditCaseTags id={detail.id} tagIds={detail.tags.map(({ tagId }) => tagId)} />
              </div>
              <div className="grid grid-cols-[170px_1fr] items-center">
                <span className="text-grey-50 font-normal">{t('cases:assigned_to')}</span>
                <EditCaseAssignee
                  disabled={detail.status === 'closed'}
                  assigneeId={detail.assignedTo}
                  currentUser={currentUser}
                  id={detail.id}
                />
              </div>
              <div className="grid grid-cols-[170px_1fr] items-center">
                <span className="text-grey-50 font-normal">{t('cases:sar.title')}</span>
                <EditCaseSuspicion id={detail.id} reports={reports} />
              </div>
            </div>

            {/* Investigation */}
            <div className="flex flex-col justify-start gap-1.5">
              <span className="text-h2 text-grey-00 px-1 font-medium">
                {t('cases:investigation')}
              </span>
              <div className="border-grey-90 bg-grey-100 flex flex-col rounded-v2-lg border">
                <div className="p-4">
                  <CaseEvents events={detail.events} inboxes={inboxes} root={containerRef} />
                </div>
                <AddComment caseId={detail.id} />
              </div>
            </div>
            {/* Alerts */}
            <div className="flex flex-col justify-start gap-1.5">
              <div className="text-h2 text-grey-00 flex items-center justify-between px-1 font-medium">
                <span>{t('cases:alerts')}</span>
                <ButtonV2 variant="secondary" onClick={() => setDrawerContentMode('snooze')}>
                  <Icon icon="snooze" className="size-3.5" />
                  {t('cases:decisions.snooze_rules')}
                </ButtonV2>
              </div>
              <CaseAlerts
                selectDecision={selectDecision}
                setDrawerContentMode={setDrawerContentMode}
                drawerContentMode={drawerContentMode}
              />
            </div>
            {/* Documents */}
            {detail.files.length > 0 ? (
              <div className="flex flex-col justify-start gap-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-grey-00 text-h2 font-medium">{t('common:documents')}</span>
                  {/* <UploadFile uploadFileEndpoint={getCaseFileUploadEndpoint(detail)}>
              <Button variant="secondary" size="small">
                <Icon icon="plus" className="size-3.5" />
                {t('common:add')}
              </Button>
            </UploadFile> */}
                </div>

                <div className="border-grey-90 bg-grey-100 flex flex-wrap gap-v2-sm rounded-v2-lg border p-v2-md">
                  {detail.files.map((file) => (
                    <CaseFile key={file.id} file={file} />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h2 className="text-h2 font-medium">{t('cases:case_detail.ai_review.title')}</h2>

              <div className="flex gap-2 justify-end">
                <ButtonV2
                  variant={caseReview?.reaction === 'ok' ? 'primary' : 'secondary'}
                  onClick={() => handleReviewReaction('ok')}
                >
                  <Icon icon="thumb-up" className="size-4" />
                  {t('cases:case_detail.ai_review.actions.feedback_ok')}
                </ButtonV2>
                <ButtonV2
                  variant={caseReview?.reaction === 'ko' ? 'primary' : 'secondary'}
                  onClick={() => handleReviewReaction('ko')}
                >
                  <Icon icon="thumb-down" className="size-4" />
                  {t('cases:case_detail.ai_review.actions.feedback_ko')}
                </ButtonV2>
                <ButtonV2 variant="secondary" onClick={() => handleAddCommentReview()}>
                  <Icon icon="comment" className="size-4" />
                  {t('cases:case_detail.ai_review.actions.add_to_comment')}
                </ButtonV2>
              </div>
            </div>
            <div className="border border-grey-90 rounded-lg p-4 bg-grey-100">
              <Markdown>{caseReview?.review.output ?? ''}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
