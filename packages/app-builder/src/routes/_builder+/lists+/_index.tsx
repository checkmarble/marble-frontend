import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/node';

// Redirect to new Detection > Lists route
export const loader = () => redirect(getRoute('/detection/lists'));
