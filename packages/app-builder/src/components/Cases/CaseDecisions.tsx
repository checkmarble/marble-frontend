import { type Decision } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';

import { DecisionsList } from '../Decisions';
import { casesI18n } from './cases-i18n';

export function CaseDecisions({ decisions }: { decisions: Decision[] }) {
  const { t } = useTranslation(casesI18n);

  return (
    <Collapsible.Container>
      <Collapsible.Title>
        <div className="flex flex-1 items-center justify-between">
          <span className="text-grey-100 text-m font-bold capitalize">
            {t('cases:case.decisions')}
          </span>
          <span className="text-grey-25 text-xs font-normal capitalize">
            {t('cases:case_detail.decisions_count', {
              count: decisions.length,
            })}
          </span>
        </div>
      </Collapsible.Title>
      <Collapsible.Content>
        <DecisionsList
          decisions={decisions}
          columnVisibility={{ case: false }}
        />
      </Collapsible.Content>
    </Collapsible.Container>
  );
}
