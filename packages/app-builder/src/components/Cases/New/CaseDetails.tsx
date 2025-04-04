import useIntersection from '@app-builder/hooks/useIntersection';
import { type CurrentUser } from '@app-builder/models';
import { type CaseDetail } from '@app-builder/models/cases';
import { type Inbox } from '@app-builder/models/inbox';
import { handle } from '@app-builder/routes/_builder+/cases+/$caseId._layout';
import { CloseCase } from '@app-builder/routes/ressources+/cases+/close-case';
import { EditCaseAssignee } from '@app-builder/routes/ressources+/cases+/edit-assignee';
import { EditCaseInbox } from '@app-builder/routes/ressources+/cases+/edit-inbox';
import { EditCaseName } from '@app-builder/routes/ressources+/cases+/edit-name';
import { EditCaseSuspicion } from '@app-builder/routes/ressources+/cases+/edit-suspicion';
import { EditCaseTags } from '@app-builder/routes/ressources+/cases+/edit-tags';
import { EscalateCase } from '@app-builder/routes/ressources+/cases+/escalate-case';
import { SnoozeCase } from '@app-builder/routes/ressources+/cases+/snooze-case';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { type RefObject, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { caseStatusMapping } from '../CaseStatus';
import { CaseHistory } from './CaseHistory';

export const CaseDetails = ({
  detail,
  containerRef,
  inboxes,
  currentUser,
}: {
  detail: CaseDetail;
  containerRef: RefObject<HTMLDivElement>;
  inboxes: Inbox[];
  currentUser: CurrentUser;
}) => {
  const { t } = useTranslation(handle.i18n);
  const language = useFormatLanguage();
  const infoRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(infoRef, {
    root: containerRef.current,
    rootMargin: '-30px',
    threshold: 1,
  });

  return (
    <main className="flex flex-col gap-6 px-12 py-8">
      <div
        className={cn(
          'bg-purple-99 sticky top-0 z-10 flex h-[88px] items-center justify-between gap-4',
          {
            'border-b-grey-90 border-b': !intersection?.isIntersecting,
          },
        )}
      >
        <EditCaseName name={detail.name} id={detail.id} />
        <div className="flex shrink-0 items-center gap-2">
          <EscalateCase id={detail.id} />
          <SnoozeCase caseId={detail.id} snoozeUntil={detail.snoozedUntil} />
          <CloseCase id={detail.id} />
        </div>
      </div>

      <div className="border-b-grey-90 flex flex-col gap-2 border-b pb-6" ref={infoRef}>
        <div className="grid grid-cols-[120px,1fr] items-center">
          <span className="text-grey-50 text-xs font-normal">{t('cases:case.status')}</span>
          <span className="inline-flex items-center gap-1">
            <Icon
              icon="status"
              className={cn('size-5', {
                'text-red-47': caseStatusMapping[detail.status].color === 'red',
                'text-blue-58': caseStatusMapping[detail.status].color === 'blue',
                'text-grey-50': caseStatusMapping[detail.status].color === 'grey',
                'text-green-38': caseStatusMapping[detail.status].color === 'green',
              })}
            />
            <span className="text-xs font-medium capitalize">
              {t(caseStatusMapping[detail.status].tKey)}
            </span>
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
          <EditCaseSuspicion id={detail.id} />
        </div>
      </div>
      <CaseHistory events={detail.events} />
    </main>
  );
};
