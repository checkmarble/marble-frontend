import { createFileRoute, Outlet } from '@tanstack/react-router';

// Transparent layout — renders children at /settings/analytics/*
export const Route = createFileRoute('/_app/_builder/settings/analytics')({
  component: () => <Outlet />,
});
