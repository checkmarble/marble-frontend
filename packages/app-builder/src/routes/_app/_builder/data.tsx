import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst } from '@app-builder/models';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const dataLayoutLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function dataLayout({ context }) {
    const { user, dataModelRepository, entitlements } = context.authInfo;

    if (isAnalyst(user)) {
      throw redirect({ to: '/cases' });
    }

    const dataModel = await dataModelRepository.getDataModel();

    return { dataModel, dataModelFeatureAccess: dataModelFeatureAccessLoader(user, entitlements) };
  });

export const Route = createFileRoute('/_app/_builder/data')({
  staticData: {
    i18n: ['navigation', 'data'],
  },
  loader: () => dataLayoutLoader(),
  component: DataLayout,
});

function DataLayout() {
  const { dataModel, dataModelFeatureAccess } = Route.useLoaderData();

  return (
    <DataModelContextProvider dataModel={dataModel} dataModelFeatureAccess={dataModelFeatureAccess}>
      <Outlet />
    </DataModelContextProvider>
  );
}
