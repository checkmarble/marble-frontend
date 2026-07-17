import { AddComment } from '@app-builder/components/Cases/AddComment';
import { CloseCase } from '@app-builder/components/Cases/CloseCase';
import { OpenCase } from '@app-builder/components/Cases/OpenCase';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import useIntersection from '@app-builder/hooks/useIntersection';
import { type CurrentUser, DataModel, isAdmin } from '@app-builder/models';
import { CaseDetail, CaseReview, SuspiciousActivityReport } from '@app-builder/models/cases';
import { useAddReviewToCaseCommentsMutation } from '@app-builder/queries/add-review-to-case-comments';
import { useCaseReviewFeedbackMutation } from '@app-builder/queries/case-review-feedback';
import { useCaseDecisionsQuery } from '@app-builder/queries/cases/list-decisions';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, cn, Markdown, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CaseFileButton } from '../CaseManager/shared/CaseDocuments/CaseFileButton';
import { CaseAlerts } from './CaseAlerts';
import { CaseEvents } from './CaseEvents';
import { CaseStatusBadgeV2 } from './CaseStatus';
import { EditCaseAssignee } from './EditAssignee';
import { EditCaseInbox } from './EditCaseInbox';
import { EditCaseName } from './EditCaseName';
import { EditCaseSuspicion } from './EditCaseSuspicion';
import { EditCaseTags } from './EditTags';
import { EscalateCase } from './EscalateCase';
import { SnoozeCase } from './SnoozeCase';

export const CaseDetails = ({
  currentUser,
  setDrawerContentMode,
  caseReview,
  caseDetail,
  dataModel,
  reports,
}: {
  currentUser: CurrentUser;
  setDrawerContentMode: (mode: 'pivot' | 'snooze') => void;
  caseReview: CaseReview | null;
  caseDetail: CaseDetail;
  dataModel: DataModel;
  reports: SuspiciousActivityReport[];
}) => {
  const { t } = useTranslation(['common', 'cases']);
  const formatDateTime = useFormatDateTime();
  const getCopyToClipboardProps = useGetCopyToClipboard();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(sentinelRef, {
    root: containerRef.current,
    threshold: 1,
  });
  const reviewReactionMutation = useCaseReviewFeedbackMutation(caseDetail.id, caseReview?.id);
  const addReviewToCaseCommentsMutation = useAddReviewToCaseCommentsMutation(caseDetail.id, caseReview?.id);

  const caseDecisionsQuery = useCaseDecisionsQuery(caseDetail.id);
  const hasRuleHits = caseDecisionsQuery.data?.pages.some((page) =>
    page.decisions.some((d) => d.rules.some((r) => r.outcome === 'hit')),
  );

  const [selectedTab, setSelectedTab] = useState<'caseDetails' | 'review'>('caseDetails');
  const revalidate = useLoaderRevalidator();
  const handleReviewReaction = (reaction: 'ok' | 'ko') => {
    reviewReactionMutation.mutateAsync(reaction).then(() => revalidate());
  };
  const handleAddCommentReview = () => {
    addReviewToCaseCommentsMutation
      .mutateAsync()
      .then(() => {
        toast.success(t('cases:case_detail.ai_review.actions.add_to_comment.success'));
        revalidate();
      })
      .catch(() => {
        toast.error(t('common:errors.unknown'));
      });
  };

  return (
    <div
      ref={containerRef}
      className="relative flex w-full min-w-0 flex-col gap-lg overflow-y-auto overflow-x-hidden bg-surface-page pb-lg"
    >
      <div ref={sentinelRef} className="absolute left-0 top-0" />
      <div
        className={cn('bg-inherit sticky top-0 z-10 flex flex-col gap-md px-lg pt-lg', {
          'border-b-grey-border border-b': !intersection?.isIntersecting,
        })}
      >
        <div className={cn('flex shrink-0 items-center justify-between gap-sm', { 'pb-lg': !caseReview })}>
          {caseReview ? (
            <div className="bg-purple-background-light flex rounded-lg p-xs">
              <button
                className={cn('flex items-center gap-sm rounded px-sm py-xs text-s font-medium transition-colors', {
                  'bg-purple-primary text-white': selectedTab === 'caseDetails',
                  'text-purple-primary': selectedTab !== 'caseDetails',
                })}
                onClick={() => setSelectedTab('caseDetails')}
              >
                {t('cases:case_detail.tab.principal')}
              </button>
              <button
                className={cn('flex items-center gap-sm rounded px-sm py-xs text-s font-medium transition-colors', {
                  'bg-purple-primary text-white': selectedTab === 'review',
                  'text-purple-primary': selectedTab !== 'review',
                })}
                onClick={() => setSelectedTab('review')}
              >
                <div
                  className={cn('size-5 rounded-md p-2xs', {
                    'text-white': selectedTab === 'review',
                    'text-purple-primary': selectedTab !== 'review',
                  })}
                >
                  <Icon icon="ai-review" className="size-4" />
                </div>
                {t('cases:case_detail.tab.ai_review')}
                {caseReview.review && !caseReview.review.ok ? (
                  <Icon icon="warning" className="size-4 text-red-primary" />
                ) : null}
              </button>
            </div>
          ) : (
            <div />
          )}
          <div className="flex shrink-0 items-center gap-sm">
            {caseDetail.status !== 'closed' ? (
              <>
                <EscalateCase id={caseDetail.id} inboxId={caseDetail.inboxId} isAdminUser={isAdmin(currentUser)} />
                <SnoozeCase caseId={caseDetail.id} snoozeUntil={caseDetail.snoozedUntil} />
              </>
            ) : null}
            {caseDetail.status !== 'closed' ? <CloseCase id={caseDetail.id} /> : <OpenCase id={caseDetail.id} />}
          </div>
        </div>
      </div>

      <div className="px-lg flex flex-col gap-lg">
        {selectedTab === 'caseDetails' ? (
          <>
            {/* Case details */}
            <div className="flex flex-col justify-start gap-xs">
              <span className="text-h2 text-grey-primary px-2xs font-medium">{t('cases:case.information')}</span>
              <div className="border-grey-border text-small flex flex-col gap-lg border p-md bg-surface-card rounded-lg xl:flex-row">
                {/* Left column */}
                <div className="flex flex-1 flex-col gap-md">
                  <div className="flex gap-sm items-center">
                    <span className="text-grey-secondary w-[90px] shrink-0 font-normal leading-[18px]">
                      {t('cases:case.name_of_case')}
                    </span>
                    <EditCaseName name={caseDetail.name} id={caseDetail.id} />
                  </div>
                  <div className="flex h-6 items-center gap-sm">
                    <span className="text-grey-secondary w-[90px] shrink-0 font-normal leading-[18px]">
                      {t('cases:case.id')}
                    </span>
                    <button
                      className="border-grey-border flex h-6 w-fit shrink-0 cursor-pointer items-center gap-sm overflow-hidden rounded border py-2xs ps-sm pe-xs"
                      {...getCopyToClipboardProps(caseDetail.id)}
                    >
                      <code className="font-['Menlo',monospace] text-[10px] whitespace-nowrap overflow-hidden text-ellipsis">
                        {caseDetail.id}
                      </code>
                      <Icon icon="copy" className="size-4 shrink-0 text-grey-primary" />
                    </button>
                  </div>
                  <div className="flex h-6 items-center gap-sm">
                    <span className="text-grey-secondary w-[90px] shrink-0 font-normal leading-[18px]">
                      {t('cases:case.status')}
                    </span>
                    <span className="flex items-center gap-sm">
                      <CaseStatusBadgeV2 status={caseDetail.status} outcome={caseDetail.outcome} variant="semi-full" />
                      {caseDetail.snoozedUntil ? (
                        <span className="font-medium text-grey-primary">
                          {t('cases:case.snoozed_until', {
                            date: formatDateTime(caseDetail.snoozedUntil, { dateStyle: 'short' }),
                          })}
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className="text-grey-secondary w-[90px] shrink-0 font-normal leading-[18px]">
                      {t('cases:creation_date')}
                    </span>
                    <time className="font-medium" dateTime={caseDetail.createdAt}>
                      {formatDateTime(caseDetail.createdAt, { dateStyle: 'short' })}
                    </time>
                  </div>
                </div>
                {/* Right column */}
                <div className="flex flex-1 flex-col gap-md">
                  <div className="flex items-center gap-sm">
                    <span className="text-grey-secondary w-[90px] shrink-0 font-normal leading-[18px]">
                      {t('cases:case.inbox')}
                    </span>
                    <EditCaseInbox id={caseDetail.id} inboxId={caseDetail.inboxId} />
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className="text-grey-secondary w-[90px] shrink-0 font-normal leading-[18px]">
                      {t('cases:case.tags')}
                    </span>
                    <EditCaseTags id={caseDetail.id} tagIds={caseDetail.tags.map(({ tagId }) => tagId)} />
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className="text-grey-secondary w-[90px] shrink-0 font-normal leading-[18px]">
                      {t('cases:assigned_to')}
                    </span>
                    <EditCaseAssignee
                      disabled={caseDetail.status === 'closed'}
                      assigneeId={caseDetail.assignedTo}
                      currentUser={currentUser}
                      id={caseDetail.id}
                    />
                  </div>
                  <div className="flex h-6 items-center gap-sm">
                    <span className="text-grey-secondary w-[90px] shrink-0 font-normal leading-[18px]">
                      {t('cases:sar.title')}
                    </span>
                    <EditCaseSuspicion id={caseDetail.id} reports={reports} />
                  </div>
                </div>
              </div>
            </div>

            {/* Investigation */}
            <div className="flex flex-col justify-start gap-xs">
              <span className="text-h2 text-grey-primary px-2xs font-medium">{t('cases:investigation')}</span>
              <div className="border-grey-border bg-surface-card flex flex-col rounded-lg border">
                <div className="p-md">
                  <CaseEvents events={caseDetail.events} root={containerRef} />
                </div>
                <AddComment caseId={caseDetail.id} />
              </div>
            </div>
            {/* Alerts */}
            <div className="flex flex-col justify-start gap-xs">
              <div className="text-h2 text-grey-primary flex items-center justify-between px-2xs font-medium">
                <span>{t('cases:alerts')}</span>
                {hasRuleHits ? (
                  <Button variant="secondary" onClick={() => setDrawerContentMode('snooze')}>
                    <Icon icon="snooze" className="size-3.5" />
                    {t('cases:decisions.snooze_rules')}
                  </Button>
                ) : null}
              </div>
              <CaseAlerts caseDecisionsQuery={caseDecisionsQuery} dataModel={dataModel} />
            </div>
            {/* Documents */}
            {caseDetail.files.length > 0 ? (
              <div className="flex flex-col justify-start gap-xs">
                <div className="flex items-center justify-between px-2xs">
                  <span className="text-grey-primary text-h2 font-medium">{t('common:documents')}</span>
                  {/* <UploadFile uploadFileEndpoint={getCaseFileUploadEndpoint(detail)}>
              <Button variant="secondary" size="small">
                <Icon icon="plus" className="size-3.5" />
                {t('common:add')}
              </Button>
            </UploadFile> */}
                </div>

                <div className="border-grey-border bg-surface-card flex flex-wrap gap-sm rounded-lg border p-md">
                  {caseDetail.files.map((file) => (
                    <CaseFileButton key={file.id} file={file} />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-col gap-sm">
            <div className="flex justify-between items-center">
              <Typo variant="title2">{t('cases:case_detail.ai_review.title')}</Typo>

              <div className="flex gap-sm justify-end">
                <Button
                  variant={caseReview?.reaction === 'ok' ? 'primary' : 'secondary'}
                  onClick={() => handleReviewReaction('ok')}
                >
                  <Icon icon="thumb-up" className="size-4" />
                  {t('cases:case_detail.ai_review.actions.feedback_ok')}
                </Button>
                <Button
                  variant={caseReview?.reaction === 'ko' ? 'primary' : 'secondary'}
                  onClick={() => handleReviewReaction('ko')}
                >
                  <Icon icon="thumb-down" className="size-4" />
                  {t('cases:case_detail.ai_review.actions.feedback_ko')}
                </Button>
                <Button variant="secondary" onClick={() => handleAddCommentReview()}>
                  <Icon icon="comment" className="size-4" />
                  {t('cases:case_detail.ai_review.actions.add_to_comment')}
                </Button>
              </div>
            </div>
            {caseReview?.review && !caseReview.review.ok ? (
              <div className="flex items-center gap-sm rounded-lg border border-red-primary bg-red-primary/10 p-md">
                <Icon icon="warning" className="size-5 shrink-0 text-red-primary" />
                <span className="text-s font-medium text-red-primary">
                  {t('cases:case_detail.ai_review.consistency_warning')}
                </span>
              </div>
            ) : null}
            <div className="border border-grey-border rounded-lg p-md bg-surface-card">
              <Markdown>{caseReview?.review?.output ?? ''}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
