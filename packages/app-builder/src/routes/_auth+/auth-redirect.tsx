import { createServerFn } from '@app-builder/core/requests';
import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/server-runtime';

export const loader = createServerFn([], async function authRedirectLoader({ request, context }) {
  if (context.appConfig.auth.provider !== 'firebase') {
    throw redirect(getRoute('/sign-in'));
  }

  const authDomain = context.appConfig.auth.firebase.authDomain;
  if (!authDomain) {
    throw redirect(getRoute('/sign-in'));
  }

  const url = new URL(request.url);

  return redirect(`https://${authDomain}/__/auth/action${url.search}`);
});
