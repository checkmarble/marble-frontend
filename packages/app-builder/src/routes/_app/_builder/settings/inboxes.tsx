import { createFileRoute, Outlet } from '@tanstack/react-router';

// Transparent layout — renders children at /settings/inboxes and /settings/inboxes/:inboxId
export const Route = createFileRoute('/_app/_builder/settings/inboxes')({
  component: () => <Outlet />,
});
