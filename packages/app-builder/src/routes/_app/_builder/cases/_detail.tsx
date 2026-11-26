import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { listInboxes } from '@app-builder/server/inboxes';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const beforeLoadFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return {
      inboxes: await listInboxes(context.api),
    };
  });

export const Route = createFileRoute('/_app/_builder/cases/_detail')({
  beforeLoad: () => beforeLoadFn(),
  component: () => <Outlet />,
});
