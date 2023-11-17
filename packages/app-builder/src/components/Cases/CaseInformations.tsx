import { formatDateTime } from '@app-builder/utils/format';
import { type Case } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';

import { casesI18n } from './cases-i18n';

export function CaseInformations({
  caseDetail: { created_at },
}: {
  caseDetail: Case;
}) {
  const {
    t,
    i18n: { language },
  } = useTranslation(casesI18n);

  return (
    <Collapsible.Container>
      <Collapsible.Title>
        {t('cases:case_detail.informations')}
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="grid grid-cols-[max-content_1fr] grid-rows-1 items-center gap-x-10 gap-y-2">
          <CaseLabel>{t('cases:case.date')}</CaseLabel>
          <div>{formatDateTime(created_at, { language })}</div>
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

const CaseLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="font-semibold capitalize">{children}</div>
);
