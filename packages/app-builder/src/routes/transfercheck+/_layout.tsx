import {
  ErrorComponent,
  navigationI18n,
  SidebarButton,
  SidebarLink,
} from '@app-builder/components';
import { HelpCenter, useTransfercheckResources } from '@app-builder/components/HelpCenter';
import {
  LeftSidebar,
  LeftSidebarSharpFactory,
  ToggleSidebar,
} from '@app-builder/components/Layout/LeftSidebar';
import { UserInfo } from '@app-builder/components/UserInfo';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isMarbleAdmin, isTransferCheckUser } from '@app-builder/models';
import { isAutoAssignmentAvailable } from '@app-builder/services/feature-access';
import { segment, useSegmentIdentification } from '@app-builder/services/segment';
import { conflict, forbidden } from '@app-builder/utils/http/http-responses';
import { CONFLICT } from '@app-builder/utils/http/http-status-codes';
import { getPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookie-read.server';
import { getRoute } from '@app-builder/utils/routes';
import { Form, isRouteErrorResponse, Outlet, useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { useRefreshToken } from '../ressources+/auth+/refresh';

export const loader = createServerFn(
  [authMiddleware],
  async function transfercheckLayoutLoader({ request, context }) {
    const { entitlements, user, partnerRepository } = context.authInfo;

    if (isMarbleAdmin(user)) {
      throw conflict("Marble Admins can't access the app builder.");
    }

    if (!isTransferCheckUser(user)) {
      throw forbidden('Only TransferCheck users can access TransferCheck.');
    }

    const partner = await partnerRepository.getPartner(user.partnerId);

    return {
      entitlements,
      user,
      partner,
      versions: context.appConfig.versions,
      authProvider: context.appConfig.auth.provider,
      isMenuExpanded: getPreferencesCookie(request, 'menuExpd'),
    };
  },
);

export const handle = {
  i18n: ['common', 'transfercheck', ...navigationI18n] satisfies Namespace,
};

const TokenRefresher = () => {
  useRefreshToken();
  return null;
};

export default function Builder() {
  const { entitlements, user, partner, versions, isMenuExpanded, authProvider } =
    useLoaderData<typeof loader>();
  useSegmentIdentification(user);
  const leftSidebarSharp = LeftSidebarSharpFactory.createSharp(isMenuExpanded);

  const transfercheckResources = useTransfercheckResources();

  return (
    <>
      <ClientOnly>{() => (authProvider === 'firebase' ? <TokenRefresher /> : null)}</ClientOnly>
      <div className="flex h-full flex-1 flex-row overflow-hidden">
        <LeftSidebarSharpFactory.Provider value={leftSidebarSharp}>
          <LeftSidebar>
            <div className="h-24 px-2 pt-3">
              <UserInfo
                email={user.actorIdentity.email}
                firstName={user.actorIdentity.firstName}
                lastName={user.actorIdentity.lastName}
                role={user.role}
                orgOrPartnerName={partner.name}
                isAutoAssignmentAvailable={isAutoAssignmentAvailable(entitlements)}
              />
            </div>
            <nav className="flex flex-1 flex-col overflow-y-auto p-2">
              <ul className="flex flex-col gap-2">
                <li>
                  <SidebarLink
                    labelTKey="navigation:transfercheck.transfers"
                    to={getRoute('/transfercheck/transfers')}
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
                    versions={versions}
                  />
                </li>
                <li>
                  <ToggleSidebar />
                </li>
              </ul>
            </nav>
          </LeftSidebar>

          <Outlet />
        </LeftSidebarSharpFactory.Provider>
      </div>
    </>
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
          <p className="text-s mb-6">{t('common:error_boundary.marble_admin.subtitle')}</p>
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
      <div className="bg-grey-100 flex max-w-md rounded-2xl p-10 shadow-md">{errorComponent}</div>
    </div>
  );
}
