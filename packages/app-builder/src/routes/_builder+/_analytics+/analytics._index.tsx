import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/node';

// Redirect to new Detection > Analytics route
export const loader = () => redirect(getRoute('/detection/analytics'));

export default function Analytics() {
  return <></>;
}
