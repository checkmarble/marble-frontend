import { Page } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { GraphSessionProvider } from '@app-builder/components/Graph/GraphSessionContext';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { Tabs, tabClassName } from 'ui-design-system';

const testGraphLayoutLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function testGraphLayoutLoader({ context }) {
    const { user, dataModelRepository, entitlements } = context.authInfo;
    const dataModel = await dataModelRepository.getDataModel();
    return {
      dataModel,
      dataModelFeatureAccess: dataModelFeatureAccessLoader(user, entitlements),
    };
  });

export const Route = createFileRoute('/_app/_builder/test-graph')({
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => (
        <BreadCrumbLink to="/test-graph" isLast={isLast}>
          Test graph
        </BreadCrumbLink>
      ),
    ],
  },
  loader: () => testGraphLayoutLoader(),
  component: TestGraphLayout,
});

function TestGraphLayout() {
  const { dataModel, dataModelFeatureAccess } = Route.useLoaderData();

  return (
    <DataModelContextProvider dataModel={dataModel} dataModelFeatureAccess={dataModelFeatureAccess}>
      <GraphSessionProvider>
        <Page.Main className="min-h-0 overflow-hidden">
          <Page.Header className="h-auto flex-col items-start justify-center gap-sm py-md">
            <BreadCrumbs />
            <Tabs>
              <Link to="/test-graph" activeOptions={{ exact: true }} className={tabClassName}>
                Graph
              </Link>
              <Link to="/test-graph/settings" className={tabClassName}>
                Settings
              </Link>
            </Tabs>
          </Page.Header>
          <Page.Container className="min-h-0">
            <Outlet />
          </Page.Container>
        </Page.Main>
      </GraphSessionProvider>
    </DataModelContextProvider>
  );
}
