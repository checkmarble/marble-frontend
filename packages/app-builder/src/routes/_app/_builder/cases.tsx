import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';

const casesLayoutLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function casesLayoutLoader({ context }) {
    const { user, dataModelRepository, entitlements } = context.authInfo;

    const dataModel = await dataModelRepository.getDataModel();

    const dataModelFeatureAccess = dataModelFeatureAccessLoader(user, entitlements);
    return { dataModel, dataModelFeatureAccess };
  });

export const Route = createFileRoute('/_app/_builder/cases')({
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['navigation']);
        return (
          <BreadCrumbLink to="/cases" isLast={isLast}>
            {t('navigation:case_manager')}
          </BreadCrumbLink>
        );
      },
    ],
  },
  loader: () => casesLayoutLoader(),
  component: CasesLayout,
});

function CasesLayout() {
  const { dataModel, dataModelFeatureAccess } = Route.useLoaderData();

  return (
    <DataModelContextProvider dataModel={dataModel} dataModelFeatureAccess={dataModelFeatureAccess}>
      <Outlet />
    </DataModelContextProvider>
  );
}
