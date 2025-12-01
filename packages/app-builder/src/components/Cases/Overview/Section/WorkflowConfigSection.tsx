import { usePanel } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { match } from 'ts-pattern';
import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { EscalationConditionsPanelContent } from '../Panel/EscalationConditionsPanelContent';
import { WorkflowConfigPanelContent } from '../Panel/WorkflowConfigPanelContent';

interface WorkflowConfigSectionProps {
  canEdit: boolean;
}

export const WorkflowConfigSection = ({ canEdit }: WorkflowConfigSectionProps) => {
  const { openPanel } = usePanel();
  const inboxesQuery = useGetInboxesQuery();

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
              {/* Conditions d'escalation panel */}
              <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex flex-col gap-v2-md">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center gap-v2-xs">
                    <span className="text-s font-medium">Conditions d'escalation</span>
                    {canEdit ? (
                      <Tag color={hasEscalationConfig ? 'green' : 'orange'} size="small" border="rounded-sm">
                        {hasEscalationConfig ? `${escalationConfigured}/${escalationTotal} configurés` : 'A configurer'}
                      </Tag>
                    ) : (
                      <Tag color="purple" size="small" border="rounded-sm">
                        View only
                      </Tag>
                    )}
                  </div>
                  {canEdit ? (
                    <Icon
                      icon="edit"
                      className="size-5 cursor-pointer text-purple-65 hover:text-purple-60"
                      onClick={handleOpenEscalationPanel}
                    />
                  ) : (
                    <Icon
                      icon="eye"
                      className="size-5 cursor-pointer text-purple-65"
                      onClick={handleOpenEscalationPanel}
                    />
                  )}
                </div>
              </div>

              {/* Déclenchement revue AI panel */}
              <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex flex-col gap-v2-md">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center gap-v2-xs">
                    <span className="text-s font-medium">Déclenchement revue AI</span>
                    {canEdit ? (
                      <Tag color={hasWorkflowConfig ? 'green' : 'orange'} size="small" border="rounded-sm">
                        {hasWorkflowConfig ? `${workflowConfigured}/${escalationTotal} configurés` : 'A configurer'}
                      </Tag>
                    ) : (
                      <Tag color="purple" size="small" border="rounded-sm">
                        View only
                      </Tag>
                    )}
                  </div>
                  {canEdit ? (
                    <Icon
                      icon="arrow-right"
                      className="size-5 cursor-pointer text-purple-65 hover:text-purple-60"
                      onClick={handleOpenWorkflowPanel}
                    />
                  ) : (
                    <Icon
                      icon="eye"
                      className="size-5 cursor-pointer text-purple-65"
                      onClick={handleOpenWorkflowPanel}
                    />
                  )}
                </div>
              </div>
            </>
          );
        })
        .exhaustive()}
    </div>
  );
};
