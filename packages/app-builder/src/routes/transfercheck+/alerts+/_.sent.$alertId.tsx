import { ErrorComponent, Page } from '@app-builder/components';
import { AlertData } from '@app-builder/components/TransferAlerts/AlertData';
import {
  alertStatusMapping,
  alertStatusVariants,
} from '@app-builder/components/TransferAlerts/AlertStatus';
import { alertsI18n } from '@app-builder/components/TransferAlerts/alerts-i18n';
import { isNotFoundHttpError } from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { handleParseParamError } from '@app-builder/utils/http/handle-errors';
import { notFound } from '@app-builder/utils/http/http-responses';
import { parseParamsSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { shortUUIDSchema } from '@app-builder/utils/schema/shortUUIDSchema';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import type { Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, Collapsible } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

import { UpdateAlert } from '../ressources+/alert.update';

export const handle = {
  i18n: ['common', 'navigation', ...alertsI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { transferAlertRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const parsedParam = await parseParamsSafe(params, z.object({ alertId: shortUUIDSchema }));
  if (!parsedParam.success) {
    return handleParseParamError(request, parsedParam.error);
  }
  const { alertId } = parsedParam.data;

  try {
    const alert = await transferAlertRepository.getSentAlert({
      alertId,
    });

    return json({
      alert,
    });
  } catch (error) {
    if (isNotFoundHttpError(error)) {
      return notFound(null);
    }
    throw error;
  }
}

export default function SentAlertDetailPage() {
  const { t } = useTranslation(handle.i18n);
  const { alert } = useLoaderData<typeof loader>();

  const { color, tKey } = alertStatusMapping[alert.status];

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Page.BackButton />
          <span className="line-clamp-1 text-start">
            {t('transfercheck:alert_detail.sent.title')}
          </span>
          <div
            className={alertStatusVariants({
              color,
              variant: 'contained',
              className:
                'text-s border-grey-90 flex min-h-[40px] min-w-[40px] items-center justify-between gap-2 rounded border p-2 font-medium',
            })}
          >
            {t(tKey)}
          </div>
        </div>
      </Page.Header>

      <Page.Container>
        <Page.Content className="max-w-3xl">
          <Collapsible.Container className="bg-grey-100 w-full">
            <Collapsible.Title>
              {t('transfercheck:alert_detail.alert_data.title')}
            </Collapsible.Title>
            <Collapsible.Content>
              <div className="flex flex-col gap-4">
                <AlertData alert={alert} />
                <div className="flex items-center justify-end">
                  <UpdateAlert
                    defaultValue={{
                      alertId: alert.id,
                      transferEndToEndId: alert.transferEndToEndId,
                      senderIban: alert.senderIban,
                      beneficiaryIban: alert.beneficiaryIban,
                      message: alert.message,
                    }}
                  >
                    <Button>
                      <Icon icon="edit-square" className="size-5" />
                      {t('transfercheck:alert.update.title')}
                    </Button>
                  </UpdateAlert>
                </div>
              </div>
            </Collapsible.Content>
          </Collapsible.Container>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  return <ErrorComponent error={error} />;
}
