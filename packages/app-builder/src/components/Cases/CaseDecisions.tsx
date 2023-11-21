import { type Decision } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';

import { DecisionsList } from '../Decisions';
import { casesI18n } from './cases-i18n';

export function CaseDecisions({ decisions }: { decisions: Decision[] }) {
  const { t } = useTranslation(casesI18n);

  return (
    <Collapsible.Container>
      <Collapsible.Title>{t('cases:case_detail.decisions')}</Collapsible.Title>
      <Collapsible.Content>
        <DecisionsList decisions={decisions} />
      </Collapsible.Content>
    </Collapsible.Container>
  );
}
