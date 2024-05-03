import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/node';

export function loader() {
  return redirect(getRoute('/sign-in'));
}
