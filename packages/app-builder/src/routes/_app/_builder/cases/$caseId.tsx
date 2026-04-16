import { createFileRoute, Outlet } from '@tanstack/react-router';

// Transparent layout — renders children at /cases/:caseId and nested routes
export const Route = createFileRoute('/_app/_builder/cases/$caseId')({
  component: () => <Outlet />,
});
