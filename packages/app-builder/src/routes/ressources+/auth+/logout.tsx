import { serverServices } from '@app-builder/services/init.server';
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  await serverServices.authService.logout(request, { redirectTo: '/sign-in' });
}

export async function action({ request }: ActionFunctionArgs) {
  await serverServices.authService.logout(request, { redirectTo: '/sign-in' });
}
