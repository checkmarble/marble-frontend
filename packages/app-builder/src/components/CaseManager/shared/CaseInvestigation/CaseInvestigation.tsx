import { AddComment } from '@app-builder/components/Cases/AddComment';
import { CaseEvents } from '@app-builder/components/Cases/CaseEvents';
import { CaseEvent } from '@app-builder/models/cases';
import { RefObject } from 'react';
import { useTranslation } from 'react-i18next';

type CaseInvestigationProps = {
  caseId: string;
  events: CaseEvent[];
  root: RefObject<HTMLDivElement>;
};

export const CaseInvestigation = ({ caseId, events, root }: CaseInvestigationProps) => {
  const { t } = useTranslation(['cases']);

  return (
    <div className="flex flex-col justify-start gap-1.5">
      <span className="text-h2 text-grey-00 px-1 font-medium">{t('cases:investigation')}</span>
      <div className="border-grey-90 bg-grey-100 flex flex-col rounded-v2-lg border">
        <div className="p-4">
          <CaseEvents events={events} root={root} />
        </div>
        <AddComment caseId={caseId} />
      </div>
    </div>
  );
};
