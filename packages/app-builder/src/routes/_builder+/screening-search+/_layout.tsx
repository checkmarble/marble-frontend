import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { Outlet } from '@remix-run/react';

export const loader = createServerFn([authMiddleware], async () => {
  return null;
});

export default function ScreeningSearchLayout() {
  return <Outlet />;
}
