import { ActivityFollowUpPage } from '@app-builder/components/Settings/AuditEvents/AuditLogsPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

const DEFAULT_LIMIT = 25;

const pageQueryStringSchema = z.object({
  q: z.string().optional().default(''),
  limit: z.coerce.number().optional().default(DEFAULT_LIMIT),
});

const activityFollowUpLoaderSchema = z.object({
  query: pageQueryStringSchema,
});

const activityFollowUpLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(activityFollowUpLoaderSchema)
  .handler(async function activityFollowUpLoader({ context, data: { query } }) {
    const { user, apiKey } = context.authInfo;

    if (!isAdmin(user)) {
      throw redirect({ to: '/' });
    }

    const apiKeys = await apiKey.listApiKeys();

    return {
      query: query.q,
      limit: query.limit,
      apiKeys,
    };
  });

export const Route = createFileRoute('/_app/_builder/settings/audit-logs')({
  validateSearch: pageQueryStringSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => activityFollowUpLoader({ data: { query: deps } }),
  component: ActivityFollowUp,
});

function ActivityFollowUp() {
  const navigate = useNavigate();
  const { query, limit, apiKeys } = Route.useLoaderData();

  const updatePage = (newQuery: string, newLimit: number) => {
    navigate({
      to: '.',
      search: {
        q: newQuery !== '' ? newQuery : undefined,
        limit: newLimit !== DEFAULT_LIMIT ? newLimit : undefined,
      },
      replace: true,
    });
  };

  return <ActivityFollowUpPage query={query} limit={limit} updatePage={updatePage} apiKeys={apiKeys} />;
}
