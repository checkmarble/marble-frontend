import { BreadCrumbLink, BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { ClientDetailSearchPage as ClientDetailSearchPageComponent } from '@app-builder/components/ClientDetail/SearchPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { useLoaderData } from '@remix-run/react';
import { Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { z } from 'zod/v4';

const queryParams = z.object({
  table: z.string().optional(),
  terms: z.string().optional(),
});

export const handle = {
  i18n: ['common', 'client360'] satisfies Namespace,
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
};

export const loader = createServerFn([authMiddleware], async function clientDetailIndexLoader({ request, context }) {
  const { client360 } = context.authInfo;

  const tables = await client360.getClient360Tables();

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const parsedSearchParams = queryParams.parse(Object.fromEntries(searchParams));

  const payload =
    parsedSearchParams.table && parsedSearchParams.terms
      ? { table: parsedSearchParams.table, terms: parsedSearchParams.terms }
      : null;

  return { tables, payload };
});

export default function ClientDetailSearchPage() {
  const { tables, payload } = useLoaderData<typeof loader>();

  return <ClientDetailSearchPageComponent tables={tables} payload={payload} />;
}
