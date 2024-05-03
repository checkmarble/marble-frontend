import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { isMarbleCoreUser, isTransferCheckUser } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { forbidden } from '@app-builder/utils/http/http-responses';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';

export const handle = {
  i18n: authI18n,
};

/**
 * This file is used to redirect users to the correct page based on their role.
 *
 * This is unfortunately a little bit of a hack, as we originally supported a single app :
 * - Marble Core: The main app, no sub path
 * - Transfer Check: The transfer check app, with a /transfercheck sub path
 */

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { user } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  if (isMarbleCoreUser(user)) {
    return redirect(getRoute('/scenarios/'));
  }
  if (isTransferCheckUser(user)) {
    return redirect(getRoute('/transfercheck'));
  }

  return forbidden(
    'You are not allowed to access any page on this application.',
  );
}
