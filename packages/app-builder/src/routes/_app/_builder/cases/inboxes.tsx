import { createFileRoute, Outlet } from '@tanstack/react-router';

// Transparent layout — renders children at /cases/inboxes and /cases/inboxes/:inboxId
export const Route = createFileRoute('/_app/_builder/cases/inboxes')({
  component: () => <Outlet />,
});
