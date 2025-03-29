import useIntersection from '@app-builder/hooks/useIntersection';
import { type CaseDetail } from '@app-builder/models/cases';
import { type Inbox } from '@app-builder/models/inbox';
import { handle } from '@app-builder/routes/_builder+/cases+/$caseId._layout';
import { EditCaseAssignee } from '@app-builder/routes/ressources+/cases+/edit-assignee';
import { EditCaseInbox } from '@app-builder/routes/ressources+/cases+/edit-inbox';
import { EditCaseName } from '@app-builder/routes/ressources+/cases+/edit-name';
import { EditCaseSuspicion } from '@app-builder/routes/ressources+/cases+/edit-suspicion';
import { EditCaseTags } from '@app-builder/routes/ressources+/cases+/edit-tags';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import * as Ariakit from '@ariakit/react';
import { type RefObject, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, CtaClassName } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { caseStatusMapping } from '../CaseStatus';

export const CaseDetails = ({
  detail,
  containerRef,
  inboxes,
}: {
  detail: CaseDetail;
  containerRef: RefObject<HTMLDivElement>;
  inboxes: Inbox[];
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
    <main className="px-12 py-8">
      <div
        className={cn(
          'bg-purple-99 sticky top-0 flex h-[88px] items-center justify-between gap-4',
          {
            'border-b-grey-90 border-b': !intersection?.isIntersecting,
          },
        )}
      >
        <EditCaseName name={detail.name} id={detail.id} />
        <div className="flex shrink-0 items-center gap-2">
          <Ariakit.MenuProvider>
            <Ariakit.MenuButton
              className={CtaClassName({
                variant: 'secondary',
                size: 'icon',
                className: 'size-[40px]',
              })}
            >
              <Icon icon="dots-three" className="size-4" />
            </Ariakit.MenuButton>
            <Ariakit.Menu
              shift={-80}
              className="bg-grey-100 border-grey-90 mt-2 flex flex-col gap-2 rounded border p-2"
            >
              <Button variant="ghost" type="button" className="justify-start">
                <Icon icon="arrow-up" className="size-5" aria-hidden />
                Escalate
              </Button>

              <Button variant="ghost" type="button" className="justify-start">
                <Icon icon="snooze" className="size-5" aria-hidden />
                Snooze
              </Button>
            </Ariakit.Menu>
          </Ariakit.MenuProvider>

          <Button type="submit" className="flex-1">
            Close case
          </Button>
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
          <EditCaseTags caseId={detail.id} tagIds={detail.tags.map(({ tagId }) => tagId)} />
        </div>
        <div className="grid grid-cols-[120px,1fr] items-center">
          <span className="text-grey-50 text-xs font-normal">Assigned to</span>
          <EditCaseAssignee assigneeId={detail.assignedTo} id={detail.id} />
        </div>
        <div className="grid grid-cols-[120px,1fr] items-center">
          <span className="text-grey-50 text-xs font-normal">Report of suspicion</span>
          <EditCaseSuspicion id={detail.id} />
        </div>
      </div>
    </main>
  );
};
