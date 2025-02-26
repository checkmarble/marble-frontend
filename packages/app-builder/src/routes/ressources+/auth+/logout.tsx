import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const redirectToParam = url.searchParams.get('redirectTo');

  let redirectTo = getRoute('/sign-in');
  if (redirectToParam) {
    redirectTo = `${redirectTo}?redirectTo=${redirectToParam}`;
  }

  await serverServices.authService.logout(request, {
    redirectTo,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  await serverServices.authService.logout(request, {
    redirectTo: getRoute('/sign-in'),
  });
}
