import { ErrorComponent, Page } from '@app-builder/components';
import {
  AlertData,
  AlertData2,
} from '@app-builder/components/TransferAlerts/AlertData';
import { alertsI18n } from '@app-builder/components/TransferAlerts/alerts-i18n';
import { isNotFoundHttpError } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { handleParseParamError } from '@app-builder/utils/http/handle-errors';
import { notFound } from '@app-builder/utils/http/http-responses';
import { parseParamsSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { shortUUIDSchema } from '@app-builder/utils/schema/shortUUIDSchema';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';
import { z } from 'zod';

export const handle = {
  i18n: ['common', 'navigation', ...alertsI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { transferAlertRepository } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: getRoute('/sign-in'),
    },
  );

  const parsedParam = await parseParamsSafe(
    params,
    z.object({ alertId: shortUUIDSchema }),
  );
  if (!parsedParam.success) {
    return handleParseParamError(request, parsedParam.error);
  }
  const { alertId } = parsedParam.data;

  try {
    const alert = await transferAlertRepository.getAlert({
      alertId,
    });

    return json({
      alert,
    });
  } catch (error) {
    if (isNotFoundHttpError(error)) {
      return notFound(null);
    } else {
      throw error;
    }
  }
}

export default function AlertDetailPage() {
  const { t } = useTranslation(handle.i18n);
  const { alert } = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Page.BackButton />
          <span className="line-clamp-1 text-left">
            {t('transfercheck:alert_detail.title')}
          </span>
        </div>
      </Page.Header>

      <Page.Content>
        <div className="flex max-w-3xl flex-col gap-4 lg:gap-6">
          <Collapsible.Container className="bg-grey-00 w-full">
            <Collapsible.Title>
              {t('transfercheck:alert_detail.alert_data.title')}
            </Collapsible.Title>
            <Collapsible.Content>
              <AlertData alert={alert} />
            </Collapsible.Content>
          </Collapsible.Container>
          <Collapsible.Container className="bg-grey-00 w-full">
            <Collapsible.Title>
              {t('transfercheck:alert_detail.alert_data.title')}
            </Collapsible.Title>
            <Collapsible.Content>
              <AlertData2 alert={alert} />
            </Collapsible.Content>
          </Collapsible.Container>
        </div>
      </Page.Content>
    </Page.Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  return <ErrorComponent error={error} />;
}
