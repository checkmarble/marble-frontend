import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { CasesNavigationTabs } from '@app-builder/components/Cases/Navigation/Tabs';
import { Page } from '@app-builder/components/Page';
import { CaseByDateGraph } from './Graph/CaseByDateGraph';
import { CaseByInboxGraph } from './Graph/CaseByInboxGraph';
import { AIConfigSection } from './Section/AIConfigSection';
import { AutoAssignmentSection } from './Section/AutoAssignmentSection';
import { WorkflowConfigSection } from './Section/WorkflowConfigSection';

interface OverviewPageProps {
  currentUserId?: string;
  isGlobalAdmin: boolean;
  hasAutoAssignmentEntitlement: boolean;
  hasAIEntitlement: boolean;
  hasWorkflowEntitlement: boolean;
}

export const OverviewPage = ({
  currentUserId,
  isGlobalAdmin,
  hasAutoAssignmentEntitlement,
  hasAIEntitlement,
  hasWorkflowEntitlement,
}: OverviewPageProps) => {
  // AI and Workflow: only global admin can edit
  const canEditAI = hasAIEntitlement && isGlobalAdmin;
  const canEditWorkflow = hasWorkflowEntitlement && isGlobalAdmin;

  return (
    <Page.Main>
      <Page.Header>
        <BreadCrumbs />
      </Page.Header>
      <Page.Container>
        <Page.ContentV2 className="bg-white gap-v2-md">
          <div className="grid grid-cols-[1fr_calc(var(--spacing-v2-xs)_*_90)] gap-v2-lg">
            <div className="flex flex-col gap-v2-md">
              <CasesNavigationTabs />
              <div className="grid grid-cols-2 gap-v2-md">
                <CaseByDateGraph />
                <CaseByInboxGraph />
              </div>
            </div>
            <div className="flex flex-col gap-v2-lg">
              <h2 className="text-h2 font-semibold">Configurations générales</h2>
              <AutoAssignmentSection
                currentUserId={currentUserId}
                isGlobalAdmin={isGlobalAdmin}
                hasEntitlement={hasAutoAssignmentEntitlement}
              />
              <AIConfigSection canEdit={canEditAI} />
              <WorkflowConfigSection canEdit={canEditWorkflow} />
            </div>
          </div>
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
};
