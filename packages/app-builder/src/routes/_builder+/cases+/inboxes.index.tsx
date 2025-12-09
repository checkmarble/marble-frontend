import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookie-read.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromSUUIDtoUUID } from '@app-builder/utils/short-uuid';
import { redirect } from '@remix-run/server-runtime';

export const loader = createServerFn([authMiddleware], async function casesInboxesLayoutLoader({ request, context }) {
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

  throw redirect(getRoute('/cases/inboxes/:inboxId', { inboxId: targetInboxId }));
});
