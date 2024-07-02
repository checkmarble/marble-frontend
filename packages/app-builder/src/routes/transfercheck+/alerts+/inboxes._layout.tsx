import { Page, TabLink } from '@app-builder/components';
import { alertsI18n } from '@app-builder/components/TransferAlerts/alerts-i18n';
import { serverServices } from '@app-builder/services/init.server';
import { AlertsContextProvider } from '@app-builder/services/transfercheck/alerts/alerts';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'navigation', ...alertsI18n] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { transferAlertRepository } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: getRoute('/sign-in'),
    },
  );

  const alerts = await transferAlertRepository.listAlerts();

  return json({ alerts });
}

export default function AlertsPage() {
  const { t } = useTranslation(handle.i18n);
  const { alerts } = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Header>
        <Icon icon="notifications" className="mr-2 size-6" />
        {t('navigation:transfercheck.alerts')}
      </Page.Header>

      <Page.Content className="max-w-3xl">
        <nav className="bg-grey-00 border-grey-10 w-fit rounded border p-1">
          <ul className="flex flex-row gap-2">
            <li>
              <TabLink
                labelTKey="navigation:transfercheck.alerts.received"
                to={getRoute('/transfercheck/alerts/inboxes/received')}
                Icon={(props) => <Icon {...props} icon="inbox" />}
              />
            </li>
            <li>
              <TabLink
                labelTKey="navigation:transfercheck.alerts.sent"
                to={getRoute('/transfercheck/alerts/inboxes/sent')}
                Icon={(props) => <Icon {...props} icon="send" />}
              />
            </li>
          </ul>
        </nav>
        <AlertsContextProvider alerts={alerts}>
          <Outlet />
        </AlertsContextProvider>
      </Page.Content>
    </Page.Container>
  );
}
