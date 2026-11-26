import { ClientDetailSearchPage as ClientDetailSearchPageComponent } from '@app-builder/components/ClientDetail/SearchPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getClient360Tables } from '@app-builder/server/client-360';
import { getDataModel } from '@app-builder/server/data-model';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

const queryParams = z.object({
  table: z.string().optional(),
  terms: z.string().optional(),
});

const getClientDetailFn = createServerFn()
  .middleware([authMiddleware])
  .validator(queryParams)
  .handler(async function clientDetailIndexLoader({ context, data: { table, terms } }) {
    const { api, user, entitlements } = context;

    const dataModel = await getDataModel(api);
    const dataModelFeatureAccess = dataModelFeatureAccessLoader(user, entitlements);

    const tables = await getClient360Tables(api);
    const payload = table && terms ? { table, terms } : null;

    return { tables, payload, dataModel, dataModelFeatureAccess };
  });

export const Route = createFileRoute('/_app/_builder/client-detail/')({
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
