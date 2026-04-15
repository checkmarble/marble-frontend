import { ActivityFollowUpPage } from '@app-builder/components/Settings/AuditEvents/AuditLogsPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import QueryString from 'qs';
import { z } from 'zod';

const DEFAULT_LIMIT = 25;

const pageQueryStringSchema = z.object({
  q: z.string().optional().default(''),
  limit: z.coerce.number().optional().default(DEFAULT_LIMIT),
});

const activityFollowUpLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function activityFollowUpLoader({ context }) {
    const request = getRequest();
    const { user, apiKey } = context.authInfo;

    if (!isAdmin(user)) {
      throw redirect({ to: '/' });
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

export const Route = createFileRoute('/_app/_builder/settings/audit-logs')({
  loader: () => activityFollowUpLoader(),
  component: ActivityFollowUp,
});

function ActivityFollowUp() {
  const navigate = useNavigate();
  const { query, limit, apiKeys } = Route.useLoaderData();

  const updatePage = (newQuery: string, newLimit: number) => {
    const qs = QueryString.stringify(
      {
        q: newQuery !== '' ? newQuery : undefined,
        limit: newLimit !== DEFAULT_LIMIT ? newLimit : undefined,
      },
      { addQueryPrefix: true, skipNulls: true },
    );
    navigate({ to: `/settings/audit-logs${qs}`, replace: true });
  };

  return <ActivityFollowUpPage query={query} limit={limit} updatePage={updatePage} apiKeys={apiKeys} />;
}
