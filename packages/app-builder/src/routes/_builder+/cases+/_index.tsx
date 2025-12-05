import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { isInboxAdmin } from '@app-builder/services/feature-access';
import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/node';

export const loader = createServerFn([authMiddleware], async function casesIndexLoader({ context }) {
  const { user, inbox: inboxRepository } = context.authInfo;

  const inboxes = await inboxRepository.listInboxes();
  if (isAdmin(user) || inboxes.some((inbox) => isInboxAdmin(user, inbox))) {
    return redirect(getRoute('/cases/overview'));
  }

  throw redirect(getRoute('/cases/inboxes/:inboxId', { inboxId: MY_INBOX_ID }));
});
