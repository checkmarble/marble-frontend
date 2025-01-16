import {
  ErrorComponent,
  navigationI18n,
  SidebarButton,
  SidebarLink,
} from '@app-builder/components';
import {
  HelpCenter,
  useTransfercheckResources,
} from '@app-builder/components/HelpCenter';
import {
  LeftSidebar,
  ToggleSidebar,
} from '@app-builder/components/Layout/LeftSidebar';
import { UserInfo } from '@app-builder/components/UserInfo';
import { isMarbleAdmin, isTransferCheckUser } from '@app-builder/models';
import { useRefreshToken } from '@app-builder/routes/ressources+/auth+/refresh';
import { serverServices } from '@app-builder/services/init.server';
import {
  segment,
  useSegmentIdentification,
} from '@app-builder/services/segment';
import { conflict, forbidden } from '@app-builder/utils/http/http-responses';
import { CONFLICT } from '@app-builder/utils/http/http-status-codes';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import {
  Form,
  isRouteErrorResponse,
  Outlet,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { user, partnerRepository } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: getRoute('/sign-in'),
    },
  );

  if (isMarbleAdmin(user)) {
    throw conflict("Marble Admins can't access the app builder.");
  }

  if (!isTransferCheckUser(user)) {
    throw forbidden('Only TransferCheck users can access TransferCheck.');
  }

  const partner = await partnerRepository.getPartner(user.partnerId);

  return json({ user, partner });
}

export const handle = {
  i18n: ['common', 'transfercheck', ...navigationI18n] satisfies Namespace,
};

export default function Builder() {
  const { user, partner } = useLoaderData<typeof loader>();
  useSegmentIdentification(user);

  // Refresh is done in the JSX because it needs to be done in the browser
  // This is only added here to prevent "auto sign-in" on /sign-in pages... (/logout do not trigger logout from Firebase)
  useRefreshToken();

  const transfercheckResources = useTransfercheckResources();

  return (
    <div className="flex h-full flex-1 flex-row overflow-hidden">
      <LeftSidebar>
        <div className="h-24 px-2 pt-3">
          <UserInfo
            email={user.actorIdentity.email}
            firstName={user.actorIdentity.firstName}
            lastName={user.actorIdentity.lastName}
            role={user.role}
            orgOrPartnerName={partner.name}
          />
        </div>
        <nav className="flex flex-1 flex-col overflow-y-auto p-2">
          <ul className="flex flex-col gap-2">
            <li>
              <SidebarLink
                labelTKey="navigation:transfercheck.transfers"
                to={getRoute('/transfercheck/transfers/')}
                Icon={(props) => <Icon icon="transfercheck" {...props} />}
              />
            </li>
            <li>
              <SidebarLink
                labelTKey="navigation:transfercheck.alerts"
                to={getRoute('/transfercheck/alerts')}
                Icon={(props) => <Icon icon="notifications" {...props} />}
              />
            </li>
          </ul>
        </nav>
        <nav className="p-2 pb-4">
          <ul className="flex flex-col gap-2">
            <li>
              <HelpCenter
                defaultTab={transfercheckResources.defaultTab}
                resources={transfercheckResources.resources}
                MenuButton={
                  <SidebarButton
                    labelTKey="navigation:helpCenter"
                    Icon={(props) => <Icon icon="helpcenter" {...props} />}
                  />
                }
              />
            </li>
            <li>
              <ToggleSidebar />
            </li>
          </ul>
        </nav>
      </LeftSidebar>

      <Outlet />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation(handle.i18n);

  let errorComponent;
  // Handle Marble Admins, do not capture error in Sentry
  if (isRouteErrorResponse(error) && error.status === CONFLICT) {
    errorComponent = (
      <div className="bg-purple-98 flex size-full items-center justify-center">
        <div className="bg-grey-100 flex max-w-md flex-col items-center gap-4 rounded-2xl p-10 text-center shadow-md">
          <h1 className="text-l text-purple-60 font-semibold">
            {t('common:error_boundary.marble_admin.title')}
          </h1>
          <p className="text-s mb-6">
            {t('common:error_boundary.marble_admin.subtitle')}
          </p>
          <div className="mb-1">
            <Form action={getRoute('/ressources/auth/logout')} method="POST">
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
      </div>
    );
  } else {
    captureRemixErrorBoundaryError(error);

    errorComponent = <ErrorComponent error={error} />;
  }

  return (
    <div className="bg-purple-98 flex size-full items-center justify-center">
      <div className="bg-grey-100 flex max-w-md rounded-2xl p-10 shadow-md">
        {errorComponent}
      </div>
    </div>
  );
}
