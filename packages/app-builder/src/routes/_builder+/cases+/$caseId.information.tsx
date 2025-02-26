import { casesI18n } from '@app-builder/components/Cases';
import { CaseContributors } from '@app-builder/components/Cases/CaseContributors';
import { EditCaseInbox } from '@app-builder/routes/ressources+/cases+/edit-inbox';
import { EditCaseName } from '@app-builder/routes/ressources+/cases+/edit-name';
import { EditCaseTags } from '@app-builder/routes/ressources+/cases+/edit-tags';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';

import { useCurrentCase } from './$caseId._layout';

export const handle = {
  i18n: ['common', 'navigation', ...casesI18n] satisfies Namespace,
};

export default function CasePage() {
  const { t } = useTranslation(handle.i18n);
  const { caseDetail, inbox, user } = useCurrentCase();
  const language = useFormatLanguage();

  return (
    <div className="bg-grey-100 border-grey-90 grid grid-cols-[max-content_1fr] grid-rows-[repeat(5,_minmax(40px,_min-content))] items-center gap-2 rounded-lg border p-4 lg:p-6">
      <EditCaseName caseId={caseDetail.id} name={caseDetail.name} />
      <div className="text-s font-semibold first-letter:capitalize">{t('cases:case.date')}</div>
      <time dateTime={caseDetail.createdAt}>
        {formatDateTime(caseDetail.createdAt, {
          language,
          timeStyle: undefined,
        })}
      </time>
      <EditCaseInbox defaultInbox={inbox} caseId={caseDetail.id} />
      <EditCaseTags
        defaultCaseTagIds={caseDetail.tags.map(({ tagId }) => tagId)}
        caseId={caseDetail.id}
        user={user}
      />
      <div className="text-s font-semibold first-letter:capitalize">
        {t('cases:case.contributors')}
      </div>
      <CaseContributors contributors={caseDetail.contributors} />
    </div>
  );
}
