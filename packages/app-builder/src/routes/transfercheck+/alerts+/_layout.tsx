import { Page, TabLink } from '@app-builder/components';
import { alertsI18n } from '@app-builder/components/TransferAlerts/alerts-i18n';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet } from '@remix-run/react';
import type { Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'navigation', ...alertsI18n] satisfies Namespace,
};

export default function AlertsPage() {
  const { t } = useTranslation(handle.i18n);

  return (
    <Page.Main>
      <Page.Header>
        <Icon icon="notifications" className="me-2 size-6" />
        {t('navigation:transfercheck.alerts')}
      </Page.Header>

      <Page.Container>
        <Page.Content className="max-w-3xl">
          <nav className="bg-grey-100 border-grey-90 w-fit rounded border p-1">
            <ul className="flex flex-row gap-2">
              <li>
                <TabLink
                  labelTKey="navigation:transfercheck.alerts.received"
                  to={getRoute('/transfercheck/alerts/received')}
                  Icon={(props) => <Icon {...props} icon="inbox" />}
                />
              </li>
              <li>
                <TabLink
                  labelTKey="navigation:transfercheck.alerts.sent"
                  to={getRoute('/transfercheck/alerts/sent')}
                  Icon={(props) => <Icon {...props} icon="send" />}
                />
              </li>
            </ul>
          </nav>
          <Outlet />
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
