import { useTranslation } from 'react-i18next';
import { Typo } from 'ui-design-system';
import { GlobalAmount } from '../operations/GlobalAmount';
import { OngoingOperations } from '../operations/OngoingOperations';
import { OperationPeriod } from '../operations/OperationPeriod';
import { PrincipalOperations } from '../operations/PrincipalOperations';

/**
 * The operations of the declaration: the principal operations picked from the decisions of the case
 * (one decision = one line), the operations in progress entered by hand, the period, and the global
 * suspicion amount, which is typed separately and never computed from the lines.
 */
export function OperationsSection() {
  const { t } = useTranslation(['tracfin']);
  return (
    <div className="flex flex-col gap-lg">
      <Typo as="h2" variant="title2">
        {t('tracfin:draft.sections.operations')}
      </Typo>
      <p className="text-grey-secondary text-s">{t('tracfin:draft.operations.intro')}</p>
      <PrincipalOperations />
      <OngoingOperations />
      <OperationPeriod />
      <GlobalAmount />
    </div>
  );
}
