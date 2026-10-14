import { type CaseClient, type CaseStatus } from '@app-builder/models/cases';
import { useDataModel } from '@app-builder/services/data/data-model';
import { fromSUUIDtoUUID } from '@app-builder/utils/short-uuid';
import { Link, useMatch } from '@tanstack/react-router';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useTranslation } from 'react-i18next';
import { Button, Tabs, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { getObjectName, ManageClientsPanel } from './ManageClientsPanel';

export { getObjectName } from './ManageClientsPanel';

type PivotTabsProps = {
  clients: CaseClient[];
  numberedFrom?: CaseClient[];
  to: './clients/$pivotValue' | './links/$pivotValue';
  caseStatus: CaseStatus;
  userScoringAccess: FeatureAccessLevelDto;
};

export function PivotTabs({ clients, numberedFrom = clients, to, caseStatus, userScoringAccess }: PivotTabsProps) {
  const { t } = useTranslation(['cases', 'common']);
  const { caseId: caseSuuid } = useMatch({ from: '/_app/_builder/cases/_detail/s/$caseId' }).params;
  const caseId = fromSUUIDtoUUID(caseSuuid);
  const dataModel = useDataModel();

  return (
    <Tabs.Nav color="grey" variant="fluid">
      {clients.length > 1
        ? clients.map((client) => {
            const pivotValue = client.key;
            return (
              <Tabs.Link asChild key={pivotValue}>
                <Link from="/cases/s/$caseId/" to={to} params={{ pivotValue }}>
                  <span>{getObjectName(dataModel, client.tableName, client.object.data, client.objectId ?? '')}</span>
                  {client.kind === 'entity' ? (
                    <Tag color="grey" size="xs">
                      {t('cases:case_manager.added_entity')}
                    </Tag>
                  ) : null}
                </Link>
              </Tabs.Link>
            );
          })
        : null}
      <ManageClientsPanel
        clients={clients}
        caseId={caseId}
        caseStatus={caseStatus}
        userScoringAccess={userScoringAccess}
      >
        <Button variant="secondary" appearance="link">
          <Icon icon="plus" className="size-4" />
          <span>{t('cases:manage_clients')}</span>
        </Button>
      </ManageClientsPanel>
    </Tabs.Nav>
  );
}
