import useIntersection from '@app-builder/hooks/useIntersection';
import { type CurrentUser } from '@app-builder/models';
import { type CaseDetail, type SuspiciousActivityReport } from '@app-builder/models/cases';
import { type Inbox } from '@app-builder/models/inbox';
import { AddComment } from '@app-builder/routes/ressources+/cases+/add-comment';
import { CloseCase } from '@app-builder/routes/ressources+/cases+/close-case';
import { EditCaseAssignee } from '@app-builder/routes/ressources+/cases+/edit-assignee';
import { EditCaseInbox } from '@app-builder/routes/ressources+/cases+/edit-inbox';
import { EditCaseName } from '@app-builder/routes/ressources+/cases+/edit-name';
import { EditCaseSuspicion } from '@app-builder/routes/ressources+/cases+/edit-suspicion';
import { EditCaseTags } from '@app-builder/routes/ressources+/cases+/edit-tags';
import { EscalateCase } from '@app-builder/routes/ressources+/cases+/escalate-case';
import { OpenCase } from '@app-builder/routes/ressources+/cases+/open-case';
import { SnoozeCase } from '@app-builder/routes/ressources+/cases+/snooze-case';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { type RefObject, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { CaseEvents } from './CaseEvents';
import { casesI18n } from './cases-i18n';
import { caseStatusMapping } from './CaseStatus';

export const CaseDetails = ({
  detail,
  containerRef,
  inboxes,
  currentUser,
  reports,
}: {
  detail: CaseDetail;
  containerRef: RefObject<HTMLDivElement>;
  inboxes: Inbox[];
  currentUser: CurrentUser;
  reports: SuspiciousActivityReport[];
}) => {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const infoRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(infoRef, {
    root: containerRef.current,
    rootMargin: '-48px',
    threshold: 1,
  });

  return (
    <main className="flex w-full min-w-0 flex-col gap-6 px-12 py-8">
      <div
        className={cn(
          'bg-purple-99 sticky top-0 z-10 flex h-[88px] items-center justify-between gap-4',
          { 'border-b-grey-90 border-b': !intersection?.isIntersecting },
        )}
      >
        <EditCaseName name={detail.name} id={detail.id} />
        <div className="flex shrink-0 items-center gap-2">
          {detail.status !== 'closed' ? <EscalateCase id={detail.id} /> : null}
          <SnoozeCase caseId={detail.id} snoozeUntil={detail.snoozedUntil} />
          {detail.status !== 'closed' ? <CloseCase id={detail.id} /> : <OpenCase id={detail.id} />}
        </div>
      </div>

      <div className="border-b-grey-90 flex flex-col gap-2 border-b pb-6" ref={infoRef}>
        <div className="grid grid-cols-[120px,1fr] items-center">
          <span className="text-grey-50 text-xs font-normal">{t('cases:case.status')}</span>
          <span className="inline-flex items-center gap-1">
            {match(detail.status)
              .with('investigating', () => <Icon icon="status" className="text-blue-58 size-5" />)
              .with('pending', () => <div className="border-red-47 size-4 rounded-full border-2" />)
              .with('closed', () => <div className="bg-green-38 size-4 rounded-full" />)
              .exhaustive()}
            <span className="text-xs font-medium capitalize">
              {t(caseStatusMapping[detail.status].tKey)}
            </span>
            {detail.outcome && detail.outcome !== 'unset' ? (
              <span
                className={cn('rounded-full px-2 py-[3px] text-xs font-medium', {
                  'text-grey-50 bg-grey-95': detail.outcome === 'false_positive',
                  'bg-yellow-90 text-yellow-50': detail.outcome === 'valuable_alert',
                  'text-red-47 bg-red-95': detail.outcome === 'confirmed_risk',
                })}
              >
                {t(`cases:case.outcome.${detail.outcome}`)}
              </span>
            ) : null}
          </span>
        </div>
        <div className="grid grid-cols-[120px,1fr] items-center">
          <span className="text-grey-50 text-xs font-normal">Creation date</span>
          <time className="text-xs font-medium" dateTime={detail.createdAt}>
            {formatDateTime(detail.createdAt, {
              language,
              timeStyle: undefined,
            })}
          </time>
        </div>
        <div className="grid grid-cols-[120px,1fr] items-center">
          <span className="text-grey-50 text-xs font-normal">Inbox</span>
          <EditCaseInbox id={detail.id} inboxId={detail.inboxId} inboxes={inboxes} />
        </div>
        <div className="grid grid-cols-[120px,1fr] items-center">
          <span className="text-grey-50 text-xs font-normal">Tags</span>
          <EditCaseTags id={detail.id} tagIds={detail.tags.map(({ tagId }) => tagId)} />
        </div>
        <div className="grid grid-cols-[120px,1fr] items-center">
          <span className="text-grey-50 text-xs font-normal">Assigned to</span>
          <EditCaseAssignee
            assigneeId={detail.assignedTo}
            currentUser={currentUser}
            id={detail.id}
          />
        </div>
        <div className="grid grid-cols-[120px,1fr] items-center">
          <span className="text-grey-50 text-xs font-normal">Report of suspicion</span>
          <EditCaseSuspicion id={detail.id} reports={reports} />
        </div>
      </div>
      <div className="flex flex-col justify-start gap-1.5">
        <span className="text-r text-grey-00 px-1 font-medium">Investigation</span>
        <div className="border-grey-90 bg-grey-100 flex flex-col rounded-lg border">
          <div className="p-4">
            <CaseEvents events={detail.events} inboxes={inboxes} />
          </div>
          <AddComment caseId={detail.id} />
        </div>
      </div>
      <div className="flex flex-col justify-start gap-1.5">
        <div className="text-r text-grey-00 flex items-center justify-between px-1 font-medium">
          <span>Alerts</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <Icon icon="arrow-top-left" className="size-3.5" />
              <span className="text-xs">Review pending sanction checks</span>
            </Button>
            <Button variant="secondary" size="sm">
              <Icon icon="snooze" className="size-5" />
              <span className="text-xs">Snooze rules</span>
            </Button>
          </div>
        </div>
        <div className="border-grey-90 bg-grey-100 flex flex-col rounded-lg border">
          There is {detail.decisions.length} alerts
        </div>
      </div>
    </main>
  );
};
