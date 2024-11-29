import { Page } from '@app-builder/components';
import { TestRunPreview } from '@app-builder/components/Scenario/TestRun/TestRunPreview';
import { type User } from '@app-builder/models';
import { type ScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useCurrentScenario, useScenarioIterations } from './_layout';

export const handle = {
  i18n: ['scenarios', 'navigation', 'common'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const testRunId = params['testRunId'] as string; //fromParams(params, 'testRunId');
  const { testRunRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const run = await testRunRepository.getTestRun({
    testRunId,
  });

  return json({ run });
}

export default function TestRun() {
  const { t } = useTranslation(handle.i18n);
  const currentScenario = useCurrentScenario();
  const { orgUsers } = useOrganizationUsers();
  const scenarioIterations = useScenarioIterations();
  const { run } = useLoaderData<typeof loader>();

  const users = useMemo(
    () =>
      orgUsers.reduce(
        (acc, curr) => {
          acc[curr.userId] = {
            firstName: curr.firstName,
            lastName: curr.lastName,
          };

          return acc;
        },
        {} as Record<string, Pick<User, 'firstName' | 'lastName'>>,
      ),
    [orgUsers],
  );

  const iterations = useMemo(
    () =>
      scenarioIterations.reduce(
        (acc, curr) => {
          acc[curr.id] = {
            version: curr.version,
            type: curr.type,
          };

          return acc;
        },
        {} as Record<
          string,
          Pick<ScenarioIterationWithType, 'version' | 'type'>
        >,
      ),
    [scenarioIterations],
  );

  return (
    <Page.Main>
      <Page.Header className="gap-4">
        <Page.BackLink
          to={getRoute('/scenarios/:scenarioId/test-run', {
            scenarioId: fromUUID(currentScenario.id),
          })}
        />
        <p className="line-clamp-2 text-start">{currentScenario.name}</p>
        <p className="text-grey-50 line-clamp-2">
          {t('scenarios:home.testrun')}
        </p>
      </Page.Header>

      <Page.Container>
        <Page.Description>
          {t('scenarios:testrun.description')}
        </Page.Description>
        <Page.Content className="max-w-screen-lg">
          <div className="grid-cols-test-run text-s grid font-semibold">
            <span className="px-4">
              {t('scenarios:testrun.filters.version')}
            </span>
            <span className="px-4">
              {t('scenarios:testrun.filters.period')}
            </span>
            <span className="text-center">
              {t('scenarios:testrun.filters.creator')}
            </span>
            <span className="px-4">
              {t('scenarios:testrun.filters.status')}
            </span>
          </div>
          <TestRunPreview
            {...run}
            users={users}
            iterations={iterations}
            className="p-8"
          />
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
