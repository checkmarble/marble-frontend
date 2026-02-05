import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/node';

export const loader = () => redirect(getRoute('/account/profile'));
