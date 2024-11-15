import { Page } from '@app-builder/components/Page';
import {
  getFormattedLive,
  getFormattedVersion,
  ScenarioIterationMenu,
} from '@app-builder/components/Scenario/Iteration/ScenarioIterationMenu';
import { type ScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { UpdateScenario } from '@app-builder/routes/ressources+/scenarios+/update';
import { serverServices } from '@app-builder/services/init.server';
import {
  formatDateRelative,
  useFormatLanguage,
} from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import * as Ariakit from '@ariakit/react';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrated } from 'remix-utils/use-hydrated';
import { Button, MenuButton } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { useCurrentScenario, useScenarioIterations } from './_layout';

export const handle = {
  i18n: ['common', 'scenarios'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService, featureAccessService } = serverServices;
  const { user } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  return json({
    featureAccess: {
      isEditScenarioAvailable:
        featureAccessService.isEditScenarioAvailable(user),
    },
  });
}

export default function ScenarioHome() {
  const { t } = useTranslation(handle.i18n);
  const hydrated = useHydrated();
  const { featureAccess } = useLoaderData<typeof loader>();

  const currentScenario = useCurrentScenario();
  const scenarioIterations = useScenarioIterations();

  return (
    <Page.Main>
      <Page.Header className="justify-between gap-4">
        <div className="flex w-full flex-row items-center justify-between gap-4">
          <div className="flex flex-row items-center gap-4">
            <Page.BackLink to={getRoute('/scenarios/')} />
            <p className="line-clamp-2 text-start">{currentScenario.name}</p>
            <div className="text-s bg-purple-05 flex h-10 items-center gap-2 rounded p-2 font-normal text-purple-100">
              {currentScenario.triggerObjectType}

              <Ariakit.HovercardProvider
                showTimeout={0}
                hideTimeout={0}
                placement="bottom"
              >
                <Ariakit.HovercardAnchor
                  tabIndex={-1}
                  className="cursor-pointer text-purple-50 transition-colors hover:text-purple-100"
                >
                  <Icon icon="tip" className="size-5" />
                </Ariakit.HovercardAnchor>
                <Ariakit.Hovercard
                  portal
                  gutter={16}
                  className="bg-grey-00 border-grey-10 flex w-fit max-w-80 rounded border p-2 shadow-md"
                >
                  {t('scenarios:trigger_object.description')}
                </Ariakit.Hovercard>
              </Ariakit.HovercardProvider>
            </div>
            {featureAccess.isEditScenarioAvailable ? (
              <UpdateScenario
                defaultValue={{
                  name: currentScenario.name,
                  scenarioId: currentScenario.id,
                  description: currentScenario.description,
                }}
              >
                <Button
                  variant="secondary"
                  className="isolate h-10 w-fit"
                  disabled={!hydrated}
                >
                  <Icon icon="edit-square" className="size-6" />
                  <p>{t('scenarios:update_scenario.title')}</p>
                </Button>
              </UpdateScenario>
            ) : null}
          </div>
        </div>
      </Page.Header>
      <Page.Container>
        {currentScenario.description ? (
          <Page.Description>{currentScenario.description}</Page.Description>
        ) : null}
        <Page.Content>
          <VersionSection scenarioIterations={scenarioIterations} />
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

function VersionSection({
  scenarioIterations,
}: {
  scenarioIterations: ScenarioIterationWithType[];
}) {
  const { t } = useTranslation(['scenarios']);
  const language = useFormatLanguage();

  const { quickDraft, quickVersion, otherVersions } = React.useMemo(() => {
    let quickVersion: ScenarioIterationWithType | undefined;
    const liveVersion = scenarioIterations.filter(
      (si) => si.type === 'live version',
    )[0];
    if (liveVersion) {
      quickVersion = liveVersion;
    } else {
      quickVersion = scenarioIterations
        .filter((si) => si.type === 'version')
        .sort((lhs, rhs) => (lhs.updatedAt > rhs.updatedAt ? -1 : 1))[0];
    }

    const quickDraft = scenarioIterations
      .filter((si) => si.type === 'draft')
      .sort((lhs, rhs) => (lhs.updatedAt > rhs.updatedAt ? -1 : 1))[0];

    const otherVersions = scenarioIterations.filter(
      (si) => si.id !== quickVersion?.id && si.id !== quickDraft?.id,
    );
    return {
      quickVersion,
      quickDraft,
      otherVersions,
    };
  }, [scenarioIterations]);

  const labelledOtherVersions = React.useMemo(
    () =>
      otherVersions.map((si) => ({
        id: si.id,
        type: si.type,
        version: si.version,
        updatedAt: si.updatedAt,
        linkTo: getRoute('/scenarios/:scenarioId/i/:iterationId', {
          scenarioId: fromUUID(si.scenarioId),
          iterationId: fromUUID(si.id),
        }),
        formattedVersion: getFormattedVersion(si, t),
        formattedLive: getFormattedLive(si, t),
        formattedUpdatedAt: formatDateRelative(si.updatedAt, {
          language,
        }),
      })),
    [language, otherVersions, t],
  );

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-grey-100 text-m font-semibold">
        {t('scenarios:home.versions', {
          count: scenarioIterations.length,
        })}
      </h2>
      <div className="flex flex-row gap-3">
        {quickVersion ? (
          <QuickVersionAccess scenarioIteration={quickVersion} />
        ) : null}
        {quickDraft ? (
          <QuickVersionAccess scenarioIteration={quickDraft} />
        ) : null}
        {labelledOtherVersions.length > 0 ? (
          <ScenarioIterationMenu
            labelledScenarioIteration={labelledOtherVersions}
          >
            <MenuButton className="text-s text-grey-100 font-semibold outline-none transition-colors hover:text-purple-100 focus:text-purple-100">
              {t('scenarios:home.other_versions', {
                count: otherVersions.length,
              })}
            </MenuButton>
          </ScenarioIterationMenu>
        ) : null}
      </div>
    </section>
  );
}

function QuickVersionAccess({
  scenarioIteration,
}: {
  scenarioIteration: ScenarioIterationWithType;
}) {
  const { t } = useTranslation(['scenarios']);

  const currentFormattedVersion = getFormattedVersion(scenarioIteration, t);
  const currentFormattedLive = getFormattedLive(scenarioIteration, t);

  return (
    <Link
      to={getRoute('/scenarios/:scenarioId/i/:iterationId', {
        scenarioId: fromUUID(scenarioIteration.scenarioId),
        iterationId: fromUUID(scenarioIteration.id),
      })}
      className="bg-grey-00 border-grey-10 text-grey-100 text-s hover:bg-grey-05 active:bg-grey-10 flex min-w-24 flex-row items-center justify-center gap-1 rounded-full border py-2 transition-colors"
    >
      <span className="text-grey-100 text-s font-semibold capitalize">
        {currentFormattedVersion}
      </span>
      {currentFormattedLive ? (
        <span className="text-s font-semibold capitalize text-purple-100">
          {currentFormattedLive}
        </span>
      ) : null}
    </Link>
  );
}
