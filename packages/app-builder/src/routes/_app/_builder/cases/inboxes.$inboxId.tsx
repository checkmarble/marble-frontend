import { InboxPage } from '@app-builder/components/Cases/InboxPage';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { DEFAULT_CASE_PAGINATION_SIZE } from '@app-builder/repositories/CaseRepository';
import { isInboxAdmin } from '@app-builder/services/feature-access';
import { getPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookie-read.server';
import { fromSUUIDtoUUID, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod/v4';

const pageQueryStringSchema = z.object({
  q: z.string().optional().default(''),
  limit: z.coerce.number().optional().default(DEFAULT_CASE_PAGINATION_SIZE),
  order: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

const casesInboxesLoaderSchema = z.object({
  params: z.object({
    inboxId: z.string().transform((id) => (id === MY_INBOX_ID ? id : fromSUUIDtoUUID(id))),
  }),
  query: pageQueryStringSchema,
});

const casesInboxesLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(casesInboxesLoaderSchema)
  .handler(async function casesInboxesLoader({ context, data: { params, query } }) {
    const request = getRequest();
    const { user, inbox: inboxRepository } = context.authInfo;
    const inboxes = await inboxRepository.listInboxesWithCaseCount();
    const canViewNavigationTabs = isAdmin(user) || inboxes.some((inbox) => isInboxAdmin(user, inbox));

    let inboxUsersIds: string[] = [];
    let currentInbox = inboxes.find((inbox) => inbox.id === params.inboxId);
    if (currentInbox) {
      inboxUsersIds = currentInbox.users.map((user) => user.userId);
    }

    const favoriteInboxId = getPreferencesCookie(request, 'favInbox') || undefined;

    return {
      inboxId: params.inboxId,
      currentInbox,
      inboxes,
      inboxUsersIds,
      canViewNavigationTabs,
      query: query.q,
      limit: query.limit,
      order: query.order,
      favoriteInboxId,
    };
  });

export const Route = createFileRoute('/_app/_builder/cases/inboxes/$inboxId')({
  validateSearch: pageQueryStringSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ params, deps }) => casesInboxesLoader({ data: { params, query: deps } }),
  component: CasesInboxesPage,
});

function CasesInboxesPage() {
  const navigate = useNavigate();
  const { inboxId, inboxes, inboxUsersIds, canViewNavigationTabs, query, limit, order, favoriteInboxId } =
    Route.useLoaderData();
  const updatePage = (newQuery: string, newLimit: number, newOrder: 'ASC' | 'DESC') => {
    navigate({
      to: '.',
      from: '/cases/inboxes/$inboxId',
      search: {
        q: newQuery !== '' ? newQuery : undefined,
        limit: newLimit !== DEFAULT_CASE_PAGINATION_SIZE ? newLimit : undefined,
        order: newOrder !== 'DESC' ? newOrder : undefined,
      },
      replace: true,
    });
  };

  const onInboxSelect = (inboxId: string) => {
    const inboxIdSUUID = inboxId === MY_INBOX_ID ? inboxId : fromUUIDtoSUUID(inboxId);
    navigate({ to: `/cases/inboxes/$inboxId`, params: { inboxId: inboxIdSUUID } });
  };

  return (
    <InboxPage
      inboxId={inboxId}
      inboxes={inboxes}
      inboxUsersIds={inboxUsersIds}
      canViewNavigationTabs={canViewNavigationTabs}
      query={query}
      limit={limit}
      order={order}
      updatePage={updatePage}
      onInboxSelect={onInboxSelect}
      favoriteInboxId={favoriteInboxId}
    />
  );
}
