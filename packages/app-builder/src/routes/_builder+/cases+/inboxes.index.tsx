import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/server-runtime';

export const loader = createServerFn([authMiddleware], async function casesInboxesLayoutLoader({ context }) {
  throw redirect(getRoute('/cases/inboxes/:inboxId', { inboxId: MY_INBOX_ID }));
});
