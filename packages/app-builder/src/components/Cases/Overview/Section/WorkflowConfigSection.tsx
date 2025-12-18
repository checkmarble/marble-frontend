import { SlaConfigPanelContent } from '@app-builder/components/Cases/Overview/Panel/SlaConfigPanelContent';
import { Spinner } from '@app-builder/components/Spinner';
import { type InboxMetadata } from '@app-builder/models/inbox';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { isAccessible } from '@app-builder/services/feature-access';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Panel, Tag } from 'ui-design-system';
import { EscalationConditionsPanelContent } from '../Panel/EscalationConditionsPanelContent';
import { WorkflowConfigPanelContent } from '../Panel/WorkflowConfigPanelContent';
import { ConfigRow } from './ConfigRow';

interface WorkflowConfigSectionProps {
  isGlobalAdmin: boolean;
  aiAssistAccess: FeatureAccessLevelDto;
  allInboxesMetadata: InboxMetadata[];
}

export const WorkflowConfigSection = ({
  isGlobalAdmin,
  aiAssistAccess,
  allInboxesMetadata,
}: WorkflowConfigSectionProps) => {
  const { t } = useTranslation(['cases']);
  const [escalationPanelOpen, setEscalationPanelOpen] = useState(false);
  const [workflowPanelOpen, setWorkflowPanelOpen] = useState(false);
  const [slaPanelOpen, setSlaPanelOpen] = useState(false);
  const inboxesQuery = useGetInboxesQuery();

  const aiAssistHasAccess = isAccessible(aiAssistAccess);

  const handleOpenEscalationPanel = () => {
    setEscalationPanelOpen(true);
  };

  const canEditAiReview = aiAssistHasAccess && isGlobalAdmin;

  const handleOpenWorkflowPanel = () => {
    setWorkflowPanelOpen(true);
  };

  const handleOpenSlaPanel = () => {
    setSlaPanelOpen(true);
  };

  return (
    <div className="flex flex-col gap-sm">
      {/* Section header */}
      <div className="flex items-center gap-sm h-7">
        <span className="flex-1 text-s font-medium">{t('cases:overview.config.workflow_title')}</span>
      </div>

      {match(inboxesQuery)
        .with({ isPending: true }, () => (
          <div className="border border-grey-border rounded-lg p-md bg-surface-card flex items-center justify-center min-h-25">
            <Spinner className="size-6" />
          </div>
        ))
        .with({ isError: true }, () => (
          <div className="border border-grey-border rounded-lg p-md bg-surface-card flex items-center justify-center min-h-25 text-red-primary">
            {t('cases:overview.config.error_loading')}
          </div>
        ))
        .with({ isSuccess: true }, ({ data }) => {
          const inboxes = data?.inboxes ?? [];

          // Count escalation configurations
          const escalationConfigured = inboxes.filter((i) => i.escalationInboxId).length;
          const inboxesTotal = inboxes.length;
          const hasEscalationConfig = escalationConfigured > 0;

          // Count workflow configurations (inboxes with at least one case review trigger)
          const workflowConfigured = inboxes.filter(
            (i) => i.caseReviewManual || i.caseReviewOnCaseCreated || i.caseReviewOnEscalate,
          ).length;
          const hasWorkflowConfig = workflowConfigured > 0;
          const slaConfigured = inboxes.filter((i) => i.sla !== null && i.sla !== undefined).length;
          const hasSlaConfig = slaConfigured > 0;

          return (
            <>
              <ConfigRow
                isRestricted={false}
                canEdit={isGlobalAdmin}
                label={t('cases:overview.config.escalation_conditions')}
                statusTag={
                  <Tag color={hasEscalationConfig ? 'green' : 'orange'} size="small">
                    {hasEscalationConfig
                      ? t('cases:overview.config.x_of_y_configured', {
                          configured: escalationConfigured,
                          total: inboxesTotal,
                        })
                      : t('cases:overview.config.not_configured')}
                  </Tag>
                }
                editIcon="edit"
                upsaleTitle={t('cases:overview.upsale.workflow_config.title')}
                upsaleDescription={t('cases:overview.upsale.workflow_config.description')}
                onClick={handleOpenEscalationPanel}
              />
              {isGlobalAdmin ? (
                <ConfigRow
                  isRestricted={!aiAssistHasAccess}
                  canEdit={canEditAiReview}
                  label={t('cases:overview.config.ai_review_trigger')}
                  statusTag={
                    <Tag color={hasWorkflowConfig ? 'green' : 'orange'} size="small">
                      {hasWorkflowConfig
                        ? t('cases:overview.config.x_of_y_configured', {
                            configured: workflowConfigured,
                            total: inboxesTotal,
                          })
                        : t('cases:overview.config.not_configured')}
                    </Tag>
                  }
                  editIcon="arrow-right"
                  upsaleTitle={t('cases:overview.upsale.workflow_config.title')}
                  upsaleDescription={t('cases:overview.upsale.workflow_config.description')}
                  onClick={handleOpenWorkflowPanel}
                />
              ) : null}
              <ConfigRow
                isRestricted={false}
                canEdit={isGlobalAdmin}
                label={t('cases:overview.config.sla_config_trigger')}
                statusTag={
                  <Tag color={hasSlaConfig ? 'green' : 'orange'} size="small">
                    {hasSlaConfig
                      ? t('cases:overview.config.x_of_y_configured', {
                          configured: slaConfigured,
                          total: inboxesTotal,
                        })
                      : t('cases:overview.config.not_configured')}
                  </Tag>
                }
                editIcon="arrow-right"
                upsaleTitle={t('cases:overview.upsale.sla_config.title')}
                upsaleDescription={t('cases:overview.upsale.sla_config.description')}
                onClick={handleOpenSlaPanel}
              />
            </>
          );
        })
        .exhaustive()}
      <Panel.Root open={escalationPanelOpen} onOpenChange={setEscalationPanelOpen}>
        <EscalationConditionsPanelContent readOnly={!isGlobalAdmin} allInboxesMetadata={allInboxesMetadata} />
      </Panel.Root>
      <Panel.Root open={workflowPanelOpen} onOpenChange={setWorkflowPanelOpen}>
        <WorkflowConfigPanelContent readOnly={!canEditAiReview} />
      </Panel.Root>
      <Panel.Root open={slaPanelOpen} onOpenChange={setSlaPanelOpen}>
        <SlaConfigPanelContent readOnly={!isGlobalAdmin} />
      </Panel.Root>
    </div>
  );
};
