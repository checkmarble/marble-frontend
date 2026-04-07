import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookie-read.server';
import { fromSUUIDtoUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

const casesInboxesIndexLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function casesInboxesIndexLoader({ context }) {
    const request = getRequest();
    const { inbox: inboxRepository } = context.authInfo;
    const favoriteInboxId = getPreferencesCookie(request, 'favInbox');

    let targetInboxId = MY_INBOX_ID;

    if (favoriteInboxId && favoriteInboxId !== MY_INBOX_ID) {
      const inboxes = await inboxRepository.listInboxesWithCaseCount();
      const favoriteUUID = fromSUUIDtoUUID(favoriteInboxId);
      const inboxExists = inboxes.some((inbox) => inbox.id === favoriteUUID);
      if (inboxExists) {
        targetInboxId = favoriteInboxId;
      }
    } else if (favoriteInboxId === MY_INBOX_ID) {
      targetInboxId = MY_INBOX_ID;
    }

    throw redirect({ to: '/cases/inboxes/$inboxId', params: { inboxId: targetInboxId } });
  });

export const Route = createFileRoute('/_app/_builder/cases/inboxes/')({
  loader: () => casesInboxesIndexLoader(),
});
