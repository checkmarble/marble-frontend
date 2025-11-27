import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { CasesNavigationTabs } from '@app-builder/components/Cases/Navigation/Tabs';
import { Page } from '@app-builder/components/Page';
import { AIConfigSection } from './AIConfigSection';
import { AutoAssignmentSection } from './AutoAssignmentSection';
import { CaseByDateGraph } from './CaseByDateGraph';
import { CaseByInboxGraph } from './CaseByInboxGraph';
import { WorkflowConfigSection } from './WorkflowConfigSection';

export const OverviewPage = () => {
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
              <AutoAssignmentSection />
              <AIConfigSection />
              <WorkflowConfigSection />
            </div>
          </div>
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
};
