import { Page } from '@app-builder/components';
import { alertsI18n } from '@app-builder/components/TransferAlerts/alerts-i18n';
import { AlertsList } from '@app-builder/components/TransferAlerts/AlertsList';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
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

  return json({
    alerts,
  });
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
        {/* 
        TODO: 
        - think about split between received and sent alerts
        - add filters (local at least) 
        - add pagination (local at least)
        - add sorting (local at least)
        - add search (local at least)
        */}
        <AlertsList alerts={alerts} />
      </Page.Content>
    </Page.Container>
  );
}
