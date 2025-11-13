import { BreadCrumbLink, BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { InboxPage } from '@app-builder/components/Cases/InboxPage';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { DEFAULT_CASE_PAGINATION_SIZE } from '@app-builder/repositories/CaseRepository';
import { getRoute } from '@app-builder/utils/routes';
import { fromSUUIDtoUUID, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useLoaderData } from '@remix-run/react';
import { SerializeFrom } from '@remix-run/server-runtime/dist/single-fetch';
import { Namespace } from 'i18next';
import QueryString from 'qs';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

export const handle = {
  i18n: ['cases', 'filters', 'navigation'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);
      return (
        <BreadCrumbLink to={getRoute('/cases')} isLast={isLast}>
          <Icon icon="case-manager" className="me-2 size-6" />
          {t('navigation:case_manager')}
        </BreadCrumbLink>
      );
    },
    ({ isLast, data }: BreadCrumbProps<SerializeFrom<typeof loader>>) => {
      const { t } = useTranslation(['navigation', 'cases']);
      const currentInboxName = data.currentInbox?.name ?? t('cases:inbox.my-inbox.link');
      const currentInboxId = data.currentInbox ? fromUUIDtoSUUID(data.currentInbox.id) : MY_INBOX_ID;

      return (
        <BreadCrumbLink to={getRoute('/cases/inboxes/:inboxId', { inboxId: currentInboxId })} isLast={isLast}>
          {currentInboxName}
        </BreadCrumbLink>
      );
    },
  ],
};

const pageQueryStringSchema = z.object({
  q: z.string().optional().default(''),
  limit: z.coerce.number().optional().default(DEFAULT_CASE_PAGINATION_SIZE),
  order: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

export const loader = createServerFn([authMiddleware], async function casesInboxesLoader({ request, params, context }) {
  const { inbox: inboxRepository } = context.authInfo;
  const inboxes = await inboxRepository.listInboxesWithCaseCount();
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

  return {
    inboxId,
    currentInbox,
    inboxes,
    inboxUsersIds,
    query: parsedSearchParams.q,
    limit: parsedSearchParams.limit,
    order: parsedSearchParams.order,
  };
});

export default function CasesInboxesPage() {
  const navigate = useAgnosticNavigation();
  const { inboxId, inboxes, inboxUsersIds, query, limit, order } = useLoaderData<typeof loader>();
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
      query={query}
      limit={limit}
      order={order}
      updatePage={updatePage}
      onInboxSelect={onInboxSelect}
    />
  );
}
