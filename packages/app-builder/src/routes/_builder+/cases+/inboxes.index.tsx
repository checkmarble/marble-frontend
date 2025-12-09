import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookie-read.server';
import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/server-runtime';

export const loader = createServerFn([authMiddleware], async function casesInboxesLayoutLoader({ request }) {
  const favoriteInboxId = getPreferencesCookie(request, 'favInbox');
  const targetInboxId = favoriteInboxId || MY_INBOX_ID;
  throw redirect(getRoute('/cases/inboxes/:inboxId', { inboxId: targetInboxId }));
});
