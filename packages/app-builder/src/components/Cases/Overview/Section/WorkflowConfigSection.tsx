import { usePanel } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { isAccessible, isRestricted } from '@app-builder/services/feature-access';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { match } from 'ts-pattern';
import { Tag } from 'ui-design-system';

import { ConfigRow } from '../ConfigRow';
import { EscalationConditionsPanelContent } from '../Panel/EscalationConditionsPanelContent';
import { WorkflowConfigPanelContent } from '../Panel/WorkflowConfigPanelContent';

interface WorkflowConfigSectionProps {
  isGlobalAdmin: boolean;
  access: FeatureAccessLevelDto;
}

export const WorkflowConfigSection = ({ isGlobalAdmin, access }: WorkflowConfigSectionProps) => {
  const { openPanel } = usePanel();
  const inboxesQuery = useGetInboxesQuery();

  const restricted = isRestricted(access);
  const hasAccess = isAccessible(access);
  const canEdit = hasAccess && isGlobalAdmin;

  const handleOpenEscalationPanel = () => {
    openPanel(<EscalationConditionsPanelContent readOnly={!canEdit} />);
  };

  const handleOpenWorkflowPanel = () => {
    openPanel(<WorkflowConfigPanelContent readOnly={!canEdit} />);
  };

  return (
    <div className="flex flex-col gap-v2-sm">
      {/* Section header */}
      <div className="flex items-center gap-v2-sm h-7">
        <span className="flex-1 text-s font-medium">Configurations workflow</span>
      </div>

      {match(inboxesQuery)
        .with({ isPending: true }, () => (
          <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex items-center justify-center min-h-[100px]">
            <Spinner />
          </div>
        ))
        .with({ isError: true }, () => (
          <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex items-center justify-center min-h-[100px] text-red-47">
            Erreur de chargement
          </div>
        ))
        .with({ isSuccess: true }, ({ data }) => {
          const inboxes = data.inboxes;

          // Count escalation configurations
          const escalationConfigured = inboxes.filter((i) => i.escalationInboxId).length;
          const escalationTotal = inboxes.length;
          const hasEscalationConfig = escalationConfigured > 0;

          // Count workflow configurations (inboxes with at least one case review trigger)
          const workflowConfigured = inboxes.filter(
            (i) => i.caseReviewManual || i.caseReviewOnCaseCreated || i.caseReviewOnEscalate,
          ).length;
          const hasWorkflowConfig = workflowConfigured > 0;

          return (
            <>
              <ConfigRow
                isRestricted={restricted}
                canEdit={canEdit}
                label="Conditions d'escalation"
                statusTag={
                  <Tag color={hasEscalationConfig ? 'green' : 'orange'} size="small" border="rounded-sm">
                    {hasEscalationConfig ? `${escalationConfigured}/${escalationTotal} configurés` : 'A configurer'}
                  </Tag>
                }
                editIcon="edit"
                onClick={handleOpenEscalationPanel}
              />
              <ConfigRow
                isRestricted={restricted}
                canEdit={canEdit}
                label="Déclenchement revue AI"
                statusTag={
                  <Tag color={hasWorkflowConfig ? 'green' : 'orange'} size="small" border="rounded-sm">
                    {hasWorkflowConfig ? `${workflowConfigured}/${escalationTotal} configurés` : 'A configurer'}
                  </Tag>
                }
                editIcon="arrow-right"
                onClick={handleOpenWorkflowPanel}
              />
            </>
          );
        })
        .exhaustive()}
    </div>
  );
};
