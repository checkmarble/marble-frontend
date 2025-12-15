import { ActivityFollowUpPage } from '@app-builder/components/Settings/AuditEvents/ActivityFollowUpPage';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { redirect, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import QueryString from 'qs';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common', 'filters'] satisfies Namespace,
  BreadCrumb: function AuditEventsBreadcrumb() {
    const { t } = useTranslation(['settings']);
    return <span>{t('settings:activity_follow_up')}</span>;
  },
};

const DEFAULT_LIMIT = 25;

const pageQueryStringSchema = z.object({
  q: z.string().optional().default(''),
  limit: z.coerce.number().optional().default(DEFAULT_LIMIT),
});

export const loader = createServerFn([authMiddleware], async function activityFollowUpLoader({ context, request }) {
  const { user, apiKey } = context.authInfo;

  if (!isAdmin(user)) {
    return redirect(getRoute('/'));
  }

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const parsedSearchParams = pageQueryStringSchema.parse(Object.fromEntries(searchParams));

  const apiKeys = await apiKey.listApiKeys();

  return {
    query: parsedSearchParams.q,
    limit: parsedSearchParams.limit,
    apiKeys,
  };
});

export default function ActivityFollowUp() {
  const navigate = useAgnosticNavigation();
  const { query, limit, apiKeys } = useLoaderData<typeof loader>();

  const updatePage = (newQuery: string, newLimit: number) => {
    const qs = QueryString.stringify(
      {
        q: newQuery !== '' ? newQuery : undefined,
        limit: newLimit !== DEFAULT_LIMIT ? newLimit : undefined,
      },
      { addQueryPrefix: true, skipNulls: true },
    );
    navigate({ search: qs }, { replace: true });
  };

  return <ActivityFollowUpPage query={query} limit={limit} updatePage={updatePage} apiKeys={apiKeys} />;
}
