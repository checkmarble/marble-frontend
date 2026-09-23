import { Page } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { GraphSessionProvider } from '@app-builder/components/Graph/contexts/GraphSessionContext';
import { GraphAccessPlaceholder } from '@app-builder/components/Graph/GraphAccessPlaceholder';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { getGraphExplorationDisplay } from '@app-builder/services/feature-access';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const testGraphLayoutLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function testGraphLayoutLoader({ context }) {
    const { user, dataModelRepository, entitlements } = context.authInfo;
    const dataModelFeatureAccess = dataModelFeatureAccessLoader(user, entitlements);

    if (!dataModelFeatureAccess.isGraphExplorationEnabled) {
      throw redirect({ to: '/' });
    }

    const dataModel = await dataModelRepository.getDataModel();
    return {
      dataModel,
      dataModelFeatureAccess,
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
  const graphDisplay = getGraphExplorationDisplay(dataModelFeatureAccess);

  if (graphDisplay === 'placeholder') {
    return (
      <Page.Main className="min-h-0 overflow-hidden">
        <Page.Header className="h-auto flex-col items-start justify-center gap-sm py-md">
          <BreadCrumbs />
        </Page.Header>
        <Page.Container className="min-h-0 flex flex-1 flex-col">
          <GraphAccessPlaceholder />
        </Page.Container>
      </Page.Main>
    );
  }

  return (
    <DataModelContextProvider dataModel={dataModel} dataModelFeatureAccess={dataModelFeatureAccess}>
      <GraphSessionProvider>
        <Page.Main className="min-h-0 overflow-hidden">
          <Page.Header className="h-auto flex-col items-start justify-center gap-sm py-md">
            <BreadCrumbs />
          </Page.Header>
          <Page.Container className="min-h-0">
            <Outlet />
          </Page.Container>
        </Page.Main>
      </GraphSessionProvider>
    </DataModelContextProvider>
  );
}
