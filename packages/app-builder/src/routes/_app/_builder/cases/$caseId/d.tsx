import { createFileRoute, Outlet } from '@tanstack/react-router';

// Transparent layout — renders children at /cases/:caseId/d/...
export const Route = createFileRoute('/_app/_builder/cases/$caseId/d')({
  component: () => <Outlet />,
});
