import { BreadCrumbLink, BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { ClientDetailSearchPage as ClientDetailSearchPageComponent } from '@app-builder/components/ClientDetail/SearchPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';
import { z } from 'zod/v4';

const queryParams = z.object({
  table: z.string().optional(),
  terms: z.string().optional(),
});

const getClientDetailFn = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(queryParams)
  .handler(async function clientDetailIndexLoader({ context, data: { table, terms } }) {
    const { client360, user, dataModelRepository, entitlements } = context.authInfo;

    const dataModel = await dataModelRepository.getDataModel();
    const dataModelFeatureAccess = dataModelFeatureAccessLoader(user, entitlements);

    const tables = await client360.getClient360Tables();
    const payload = table && terms ? { table, terms } : null;

    return { tables, payload, dataModel, dataModelFeatureAccess };
  });

export const Route = createFileRoute('/_app/_builder/client-detail/')({
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['client360']);
        return (
          <BreadCrumbLink to="/client-detail" isLast={isLast}>
            {t('client360:client_detail.search_page.breadcrumb')}
          </BreadCrumbLink>
        );
      },
    ],
  },
  validateSearch: queryParams,
  loaderDeps: ({ search: { table, terms } }) => ({ table, terms }),
  loader: ({ deps }) => getClientDetailFn({ data: deps }),
  component: ClientDetailSearchPage,
});

function ClientDetailSearchPage() {
  const { tables, payload, dataModel, dataModelFeatureAccess } = Route.useLoaderData();

  return (
    <DataModelContextProvider dataModel={dataModel} dataModelFeatureAccess={dataModelFeatureAccess}>
      <ClientDetailSearchPageComponent tables={tables} payload={payload} />
    </DataModelContextProvider>
  );
}
