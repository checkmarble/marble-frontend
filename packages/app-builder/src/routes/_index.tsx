import { createServerFn } from '@app-builder/core/requests';
import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/node';

export const loader = createServerFn([], async function indexLoader() {
  return redirect(getRoute('/sign-in'));
});
