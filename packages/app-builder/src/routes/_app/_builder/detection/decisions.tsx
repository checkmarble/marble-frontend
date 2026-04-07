import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst } from '@app-builder/models';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';

const decisionsLayoutLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function dataLayout({ context }) {
    const { user, dataModelRepository, entitlements } = context.authInfo;

    if (isAnalyst(user)) {
      throw redirect({ to: '/cases' });
    }
    const dataModel = await dataModelRepository.getDataModel();

    const dataModelFeatureAccess = dataModelFeatureAccessLoader(user, entitlements);
    return { dataModel, dataModelFeatureAccess };
  });

export const Route = createFileRoute('/_app/_builder/detection/decisions')({
  loader: () => decisionsLayoutLoader(),
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['navigation']);

        return (
          <BreadCrumbLink to="/detection/decisions" isLast={isLast}>
            {t('navigation:decisions')}
          </BreadCrumbLink>
        );
      },
    ],
  },
  component: DecisionsLayout,
});

function DecisionsLayout() {
  const loaderData = Route.useLoaderData();
  // loaderData can be null if redirect was thrown, but we still render
  if (!loaderData) return null;
  const { dataModel, dataModelFeatureAccess } = loaderData;

  return (
    <DataModelContextProvider dataModel={dataModel} dataModelFeatureAccess={dataModelFeatureAccess}>
      <Outlet />
    </DataModelContextProvider>
  );
}
