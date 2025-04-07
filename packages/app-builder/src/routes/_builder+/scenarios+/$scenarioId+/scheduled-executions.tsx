import { ErrorComponent, Page, scenarioI18n } from '@app-builder/components';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { ScheduledExecutionsList } from '@app-builder/components/Scenario/ScheduledExecutionsList';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';

import { useCurrentScenario } from './_layout';

export const handle = {
  i18n: [...scenarioI18n] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(handle.i18n);
      const currentScenario = useCurrentScenario();

      return (
        <BreadCrumbLink
          to={getRoute('/scenarios/:scenarioId/scheduled-executions', {
            scenarioId: fromUUIDtoSUUID(currentScenario.id),
          })}
          isLast={isLast}
        >
          {t('scenarios:home.execution')}
        </BreadCrumbLink>
      );
    },
  ],
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { decision } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const scenarioId = fromParams(params, 'scenarioId');

  const scheduledExecutions = await decision.listScheduledExecutions({
    scenarioId,
  });

  return json({
    scheduledExecutions,
  });
}

export default function ScheduledExecutions() {
  const { t } = useTranslation(handle.i18n);
  const { scheduledExecutions } = useLoaderData<typeof loader>();

  return (
    <Page.Main>
      <Page.Header className="gap-4">
        <BreadCrumbs />
      </Page.Header>

      <Page.Container>
        <Page.Content className="max-w-screen-lg">
          <h1 className="text-grey-00 text-m font-bold">
            {t('scenarios:home.execution.batch.scheduled_execution', {
              count: scheduledExecutions.length,
            })}
          </h1>
          <ScheduledExecutionsList scheduledExecutions={scheduledExecutions} />
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
