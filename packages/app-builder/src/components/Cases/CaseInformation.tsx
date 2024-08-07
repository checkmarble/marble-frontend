import { type CurrentUser } from '@app-builder/models';
import { type Case } from '@app-builder/models/cases';
import { type Inbox } from '@app-builder/models/inbox';
import { EditCaseInbox } from '@app-builder/routes/ressources+/cases+/edit-inbox';
import { EditCaseName } from '@app-builder/routes/ressources+/cases+/edit-name';
import { EditCaseTags } from '@app-builder/routes/ressources+/cases+/edit-tags';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';

import { CaseContributors } from './CaseContributors';
import { casesI18n } from './cases-i18n';

export function CaseInformation({
  caseDetail: { createdAt, name, id, contributors, tags },
  inbox,
  user,
}: {
  caseDetail: Case;
  inbox: Inbox;
  user: CurrentUser;
}) {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();

  return (
    <Collapsible.Container className="bg-grey-00">
      <Collapsible.Title>
        {t('cases:case_detail.informations')}
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="grid auto-rows-fr grid-cols-[max-content_1fr] items-center gap-x-10 gap-y-2">
          <CaseLabel>{t('cases:case.name')}</CaseLabel>
          <EditCaseName caseId={id} name={name} />
          <CaseLabel>{t('cases:case.date')}</CaseLabel>
          <time dateTime={createdAt}>
            {formatDateTime(createdAt, { language, timeStyle: undefined })}
          </time>
          <CaseLabel>{t('cases:case.inbox')}</CaseLabel>
          <EditCaseInbox defaultInbox={inbox} caseId={id} />
          <CaseLabel>{t('cases:case.tags')}</CaseLabel>
          <EditCaseTags
            defaultCaseTagIds={tags.map(({ tagId }) => tagId)}
            caseId={id}
            user={user}
          />
          <CaseLabel>{t('cases:case.contributors')}</CaseLabel>
          <CaseContributors contributors={contributors} />
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

const CaseLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="font-semibold capitalize">{children}</div>
);
