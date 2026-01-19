import { InboxPage } from '@app-builder/components/Cases/InboxPage';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { DEFAULT_CASE_PAGINATION_SIZE } from '@app-builder/repositories/CaseRepository';
import { isInboxAdmin } from '@app-builder/services/feature-access';
import { getPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookie-read.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromSUUIDtoUUID, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import QueryString from 'qs';
import invariant from 'tiny-invariant';
import { z } from 'zod/v4';

export const handle = {
  i18n: ['cases', 'filters', 'navigation'] satisfies Namespace,
};

const pageQueryStringSchema = z.object({
  q: z.string().optional().default(''),
  limit: z.coerce.number().optional().default(DEFAULT_CASE_PAGINATION_SIZE),
  order: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

export const loader = createServerFn([authMiddleware], async function casesInboxesLoader({ request, params, context }) {
  const { user, inbox: inboxRepository } = context.authInfo;
  const inboxes = await inboxRepository.listInboxesWithCaseCount();
  const canViewNavigationTabs = isAdmin(user) || inboxes.some((inbox) => isInboxAdmin(user, inbox));
  const inboxIdParam = params['inboxId'];

  invariant(inboxIdParam, 'inboxId is required');

  const inboxId = inboxIdParam === MY_INBOX_ID ? inboxIdParam : fromSUUIDtoUUID(inboxIdParam);
  let inboxUsersIds: string[] = [];
  let currentInbox = inboxes.find((inbox) => inbox.id === inboxId);
  if (currentInbox) {
    inboxUsersIds = currentInbox.users.map((user) => user.userId);
  }

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const parsedSearchParams = pageQueryStringSchema.parse(Object.fromEntries(searchParams));

  const favoriteInboxId = getPreferencesCookie(request, 'favInbox') || undefined;

  return {
    inboxId,
    currentInbox,
    inboxes,
    inboxUsersIds,
    canViewNavigationTabs,
    query: parsedSearchParams.q,
    limit: parsedSearchParams.limit,
    order: parsedSearchParams.order,
    favoriteInboxId,
  };
});

export default function CasesInboxesPage() {
  const navigate = useAgnosticNavigation();
  const { inboxId, inboxes, inboxUsersIds, canViewNavigationTabs, query, limit, order, favoriteInboxId } =
    useLoaderData<typeof loader>();
  const updatePage = (newQuery: string, newLimit: number, newOrder: 'ASC' | 'DESC') => {
    const qs = QueryString.stringify(
      {
        q: newQuery !== '' ? newQuery : undefined,
        limit: newLimit !== DEFAULT_CASE_PAGINATION_SIZE ? newLimit : undefined,
        order: newOrder !== 'DESC' ? newOrder : undefined,
      },
      { addQueryPrefix: true, skipNulls: true },
    );
    navigate({ search: qs }, { replace: true });
  };

  const onInboxSelect = (inboxId: string) => {
    const inboxIdSUUID = inboxId === MY_INBOX_ID ? inboxId : fromUUIDtoSUUID(inboxId);
    navigate(getRoute('/cases/inboxes/:inboxId', { inboxId: inboxIdSUUID }));
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
