import { ClientDetailSearchPage as ClientDetailSearchPageComponent } from '@app-builder/components/ClientDetail/SearchPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { useLoaderData } from '@remix-run/react';

export const loader = createServerFn([authMiddleware], async function clientDetailIndexLoader({ context }) {
  const { client360 } = context.authInfo;

  const tables = await client360.getClient360Tables();

  return { tables };
});

export default function ClientDetailSearchPage() {
  const { tables } = useLoaderData<typeof loader>();

  return <ClientDetailSearchPageComponent tables={tables} />;
}
