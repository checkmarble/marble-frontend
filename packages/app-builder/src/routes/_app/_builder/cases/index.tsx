import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { isInboxAdmin } from '@app-builder/services/feature-access';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const casesIndexLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function casesIndexLoader({ context }) {
    const { user, inbox: inboxRepository } = context.authInfo;

    const inboxes = await inboxRepository.listInboxes();
    if (isAdmin(user) || inboxes.some((inbox) => isInboxAdmin(user, inbox))) {
      throw redirect({ to: '/cases/overview' });
    }

    throw redirect({ to: '/cases/inboxes/$inboxId', params: { inboxId: MY_INBOX_ID } });
  });

export const Route = createFileRoute('/_app/_builder/cases/')({
  loader: () => casesIndexLoader(),
});
