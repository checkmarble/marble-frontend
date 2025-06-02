import useIntersection from '@app-builder/hooks/useIntersection';
import type { CurrentUser } from '@app-builder/models';
import type { loader } from '@app-builder/routes/_builder+/cases+/$caseId+/_index';
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
import { UploadFile } from '@app-builder/routes/ressources+/files+/upload-file';
import { getCaseFileUploadEndpoint } from '@app-builder/utils/files';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { useLoaderData } from '@remix-run/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { CaseAlerts } from './CaseAlerts';
import { CaseEvents } from './CaseEvents';
import { CaseFile } from './CaseFile';
import { CaseStatusBadge } from './CaseStatus';
import { casesI18n } from './cases-i18n';

export const CaseDetails = ({
  currentUser,
  selectDecision,
  drawerContentMode,
  setDrawerContentMode,
}: {
  currentUser: CurrentUser;
  selectDecision: (id: string) => void;
  drawerContentMode: 'pivot' | 'decision' | 'snooze';
  setDrawerContentMode: (mode: 'pivot' | 'decision' | 'snooze') => void;
}) => {
  const { case: detail, inboxes, reports } = useLoaderData<typeof loader>();
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(sentinelRef, {
    root: containerRef.current,
    rootMargin: '32px',
    threshold: 1,
  });

  return (
    <main
      ref={containerRef}
      className="relative flex w-full min-w-0 flex-col gap-6 overflow-y-scroll p-8 px-12"
    >
      <div ref={sentinelRef} className="absolute left-0 top-0" />
      <div
        className={cn(
          'bg-purple-99 sticky -top-8 z-10 flex h-[88px] shrink-0 items-center justify-between gap-4',
          { 'border-b-grey-90 border-b': !intersection?.isIntersecting },
        )}
      >
        <EditCaseName name={detail.name} id={detail.id} />
        <div className="flex shrink-0 items-center gap-2">
          {detail.status !== 'closed' ? (
            <EscalateCase id={detail.id} inboxId={detail.inboxId} />
          ) : null}
          <SnoozeCase caseId={detail.id} snoozeUntil={detail.snoozedUntil} />
          {detail.status !== 'closed' ? <CloseCase id={detail.id} /> : <OpenCase id={detail.id} />}
        </div>
      </div>

      <div className="border-b-grey-90 flex flex-col gap-2 border-b pb-6">
        <div className="grid grid-cols-[170px,1fr] items-center">
          <span className="text-grey-50 text-xs font-normal">{t('cases:case.status')}</span>
          <CaseStatusBadge status={detail.status} outcome={detail.outcome} />
        </div>
        <div className="grid grid-cols-[170px,1fr] items-center">
          <span className="text-grey-50 text-xs font-normal">{t('cases:creation_date')}</span>
          <time className="text-xs font-medium" dateTime={detail.createdAt}>
            {formatDateTime(detail.createdAt, {
              language,
              timeStyle: undefined,
            })}
          </time>
        </div>
        <div className="grid grid-cols-[170px,1fr] items-center">
          <span className="text-grey-50 text-xs font-normal">{t('cases:case.inbox')}</span>
          <EditCaseInbox id={detail.id} inboxId={detail.inboxId} inboxes={inboxes} />
        </div>
        <div className="grid grid-cols-[170px,1fr] items-center">
          <span className="text-grey-50 text-xs font-normal">{t('cases:case.tags')}</span>
          <EditCaseTags id={detail.id} tagIds={detail.tags.map(({ tagId }) => tagId)} />
        </div>
        <div className="grid grid-cols-[170px,1fr] items-center">
          <span className="text-grey-50 text-xs font-normal">{t('cases:assigned_to')}</span>
          <EditCaseAssignee
            disabled={detail.status === 'closed'}
            assigneeId={detail.assignedTo}
            currentUser={currentUser}
            id={detail.id}
          />
        </div>
        <div className="grid grid-cols-[170px,1fr] items-center">
          <span className="text-grey-50 text-xs font-normal">{t('cases:sar.title')}</span>
          <EditCaseSuspicion id={detail.id} reports={reports} />
        </div>
      </div>
      <div className="flex flex-col justify-start gap-1.5">
        <span className="text-r text-grey-00 px-1 font-medium">{t('cases:investigation')}</span>
        <div className="border-grey-90 bg-grey-100 flex flex-col rounded-lg border">
          <div className="p-4">
            <CaseEvents events={detail.events} inboxes={inboxes} root={containerRef} />
          </div>
          <AddComment caseId={detail.id} />
        </div>
      </div>
      <div className="flex flex-col justify-start gap-1.5">
        <div className="text-r text-grey-00 flex items-center justify-between px-1 font-medium">
          <span>{t('cases:alerts')}</span>
          <Button variant="secondary" size="small" onClick={() => setDrawerContentMode('snooze')}>
            <Icon icon="snooze" className="size-4" />
            <span className="text-xs">{t('cases:decisions.snooze_rules')}</span>
          </Button>
        </div>
        <CaseAlerts
          selectDecision={selectDecision}
          setDrawerContentMode={setDrawerContentMode}
          drawerContentMode={drawerContentMode}
        />
      </div>
      {detail.files.length > 0 ? (
        <div className="flex flex-col justify-start gap-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-grey-00 text-r font-medium">{t('common:documents')}</span>
            <UploadFile uploadFileEndpoint={getCaseFileUploadEndpoint(detail)}>
              <Button variant="secondary" size="small">
                <Icon icon="plus" className="size-3.5" />
                {t('common:add')}
              </Button>
            </UploadFile>
          </div>

          <ClientOnly>
            {() => (
              <div className="border-grey-90 bg-grey-100 flex flex-wrap gap-2 rounded-lg border p-4">
                {detail.files.map((file) => (
                  <CaseFile key={file.id} file={file} />
                ))}
              </div>
            )}
          </ClientOnly>
        </div>
      ) : null}
    </main>
  );
};
