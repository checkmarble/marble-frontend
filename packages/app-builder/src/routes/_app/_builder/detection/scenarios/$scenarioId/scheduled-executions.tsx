import { ErrorComponent, Page, scenarioI18n } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { ScheduledExecutionsList } from '@app-builder/components/Scenario/ScheduledExecutionsList';
import { useDetectionScenarioData } from '@app-builder/hooks/routes-layout-data';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import * as Sentry from '@sentry/react';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';
import { Typo } from 'ui-design-system';

const scheduledExecutionsLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function scheduledExecutionsLoader({ data, context }) {
    const scenarioId = fromParams(data?.params ?? {}, 'scenarioId');

    const scheduledExecutions = await context.authInfo.decision.listScheduledExecutions({ scenarioId });

    return { scheduledExecutions };
  });

export const Route = createFileRoute('/_app/_builder/detection/scenarios/$scenarioId/scheduled-executions')({
  loader: ({ params }) => scheduledExecutionsLoader({ data: { params } }),
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(scenarioI18n);
        const { currentScenario } = useDetectionScenarioData();

        return (
          <BreadCrumbLink
            to="/detection/scenarios/$scenarioId/scheduled-executions"
            params={{ scenarioId: fromUUIDtoSUUID(currentScenario.id) }}
            isLast={isLast}
          >
            {t('scenarios:home.execution')}
          </BreadCrumbLink>
        );
      },
    ],
  },
  errorComponent: ({ error }) => {
    Sentry.captureException(error);
    return <ErrorComponent error={error} />;
  },
  component: ScheduledExecutions,
});

function ScheduledExecutions() {
  const { t } = useTranslation(scenarioI18n);
  const { scheduledExecutions } = Route.useLoaderData();

  return (
    <Page.Main>
      <Page.Header className="gap-4">
        <BreadCrumbs />
      </Page.Header>

      <Page.Container>
        <Page.Content className="max-w-(--breakpoint-lg)">
          <Typo variant="title1" className="text-grey-primary text-m">
            {t('scenarios:home.execution.batch.scheduled_execution', {
              count: scheduledExecutions.length,
            })}
          </Typo>
          <ScheduledExecutionsList scheduledExecutions={scheduledExecutions} />
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
