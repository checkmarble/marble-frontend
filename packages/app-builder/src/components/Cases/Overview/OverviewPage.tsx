import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { CasesNavigationTabs } from '@app-builder/components/Cases/Navigation/Tabs';
import { Page } from '@app-builder/components/Page';
import { CaseByDateGraph } from './CaseByDateGraph';
import { CaseByInboxGraph } from './CaseByInboxGraph';

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
            <div className="flex flex-col gap-v2-md">
              <div className="text-h2 font-semibold">Configuration générales</div>
              <div className="border border-grey-border rounded-v2-lg p-v2-md h-100 bg-grey-background-light"></div>
            </div>
          </div>
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
};
