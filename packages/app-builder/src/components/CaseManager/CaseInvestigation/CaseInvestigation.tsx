import { AddComment } from '@app-builder/components/Cases/AddComment';
import { CaseEvents } from '@app-builder/components/Cases/CaseEvents';
import { CaseEvent } from '@app-builder/models/cases';
import { type Inbox } from '@app-builder/models/inbox';
import { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';

type CaseInvestigationProps = {
  caseId: string;
  currentInboxId: string;
  events: CaseEvent[];
  inboxes: Inbox[];
  root: RefObject<HTMLDivElement | null>;
  className?: string;
};

export const CaseInvestigation = ({
  caseId,
  currentInboxId,
  events,
  inboxes,
  root,
  className,
}: CaseInvestigationProps) => {
  const { t } = useTranslation(['cases']);

  return (
    <div className={cn('flex flex-col justify-start gap-sm', className)}>
      <span className="text-default text-grey-primary px-2xs font-medium">{t('cases:investigation')}</span>
      <div className="border-grey-border bg-surface-card flex flex-col rounded-lg border overflow-hidden">
        <div className="p-md">
          <CaseEvents events={events} currentInboxId={currentInboxId} inboxes={inboxes} root={root} />
        </div>
        <AddComment caseId={caseId} />
      </div>
    </div>
  );
};
