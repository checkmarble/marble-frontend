import { ErrorComponent } from '@app-builder/components';
import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { isMarbleCoreUser, isTransferCheckUser } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { segment } from '@app-builder/services/segment';
import { forbidden } from '@app-builder/utils/http/http-responses';
import { FORBIDDEN } from '@app-builder/utils/http/http-status-codes';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Form, isRouteErrorResponse, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

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
    return redirect(getRoute('/scenarios'));
  }
  if (isTransferCheckUser(user)) {
    return redirect(getRoute('/transfercheck'));
  }

  return forbidden('You are not allowed to access any page on this application.');
}

export function ErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation(handle.i18n);

  let errorComponent;
  // Handle Marble Admins, do not capture error in Sentry
  if (isRouteErrorResponse(error) && error.status === FORBIDDEN) {
    errorComponent = (
      <div className="m-auto flex flex-col items-center gap-4">
        <h1 className="text-l text-purple-60 font-semibold">
          {t('common:error_boundary.marble_admin.title')}
        </h1>
        <p className="text-s mb-6">{t('common:error_boundary.marble_admin.subtitle')}</p>
        <div className="mb-1">
          <Form action={getRoute('/ressources/auth/logout')} method="post">
            <Button
              type="submit"
              onClick={() => {
                void segment.reset();
              }}
            >
              <Icon icon="logout" className="size-5" />
              {t('common:auth.logout')}
            </Button>
          </Form>
        </div>
      </div>
    );
  } else {
    captureRemixErrorBoundaryError(error);

    errorComponent = <ErrorComponent error={error} />;
  }

  return (
    <div className="bg-purple-98 flex size-full items-center justify-center">
      <div className="bg-grey-100 flex max-w-md rounded-2xl p-10 shadow-md">{errorComponent}</div>
    </div>
  );
}
