import { CurrentUser } from '@app-builder/models';
import { Case } from '@app-builder/models/cases';
import { useTranslation } from 'react-i18next';
import { EditCaseAssignee } from '../Cases/EditAssignee';
import { EditCaseInbox } from '../Cases/EditCaseInbox';
import { CopyToClipboardButton } from '../CopyToClipboardButton';

type CaseInfoProps = {
  caseDetail: Case;
  currentUser: CurrentUser;
};

export function CaseInfo({ caseDetail, currentUser }: CaseInfoProps) {
  const { t } = useTranslation(['cases']);

  return (
    <div className="grid grid-cols-[6rem_1fr] gap-y-sm gap-x-md items-center">
      <span className="text-grey-secondary">{t('cases:case.id')}</span>
      <CopyToClipboardButton toCopy={caseDetail.id}>{caseDetail.id}</CopyToClipboardButton>

      <span className="text-grey-secondary">{t('cases:assigned_to')}</span>
      <EditCaseAssignee
        disabled={false}
        id={caseDetail.id}
        assigneeId={caseDetail.assignedTo}
        currentUser={currentUser}
      />

      <span className="text-grey-secondary">{t('cases:case.inbox')}</span>
      <EditCaseInbox id={caseDetail.id} inboxId={caseDetail.inboxId} />
    </div>
  );
}
