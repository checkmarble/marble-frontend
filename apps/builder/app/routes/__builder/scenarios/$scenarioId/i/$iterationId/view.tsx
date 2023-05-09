import {
  listScenarioIterations,
  type ScenarioIteration,
} from '@marble-front/api/marble';
import {
  navigationI18n,
  ScenarioPage,
  Scenarios,
  type ScenariosLinkProps,
} from '@marble-front/builder/components';
import { useCurrentScenario } from '@marble-front/builder/routes/__builder/scenarios/$scenarioId';
import { DeploymentModal } from '@marble-front/builder/routes/ressources/scenarios/deployment';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { getRoute } from '@marble-front/builder/services/routes';
import {
  fromParams,
  fromUUID,
  toUUID,
} from '@marble-front/builder/utils/short-uuid';
import { Select } from '@marble-front/ui/design-system';
import { Decision, Rules, Trigger } from '@marble-front/ui/icons';
import { json, type LoaderArgs } from '@remix-run/node';
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
} from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import invariant from 'tiny-invariant';

export const handle = {
  i18n: [...navigationI18n, 'scenarios', 'common'] satisfies Namespace,
};

const LINKS: ScenariosLinkProps[] = [
  { labelTKey: 'navigation:scenario.trigger', to: './trigger', Icon: Trigger },
  { labelTKey: 'navigation:scenario.rules', to: './rules', Icon: Rules },
  {
    labelTKey: 'navigation:scenario.decision',
    to: './decision',
    Icon: Decision,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const scenarioId = fromParams(params, 'scenarioId');

  const scenarioIterations = await listScenarioIterations({ scenarioId });

  return json(scenarioIterations);
}

function sortScenarioIterations(
  scenarioIterations: ScenarioIteration[],
  liveVersionId?: string
) {
  return R.pipe(
    scenarioIterations,
    R.partition(({ version }) => version === undefined),
    ([drafts, versions]) => {
      const sortedDrafts = R.pipe(
        drafts,
        R.map((draft) => ({ ...draft, type: 'draft' as const })),
        R.sortBy([({ createdAt }) => createdAt, 'desc'])
      );

      const sortedVersions = R.pipe(
        versions,
        R.map((version) => ({
          ...version,
          type:
            version.id === liveVersionId
              ? ('live version' as const)
              : ('past version' as const),
        })),
        R.sortBy([({ createdAt }) => createdAt, 'desc'])
      );

      return [...sortedDrafts, ...sortedVersions];
    }
  );
}

export type SortedScenarioIteration = ReturnType<
  typeof sortScenarioIterations
> extends Array<infer ItemT>
  ? ItemT
  : unknown;

export default function ScenarioViewLayout() {
  const currentScenario = useCurrentScenario();
  const scenarioIterations = useLoaderData<typeof loader>();

  const sortedScenarioIterations = sortScenarioIterations(
    scenarioIterations,
    currentScenario.liveVersionId
  );

  const { iterationId } = useParams();
  invariant(iterationId, 'iterationId is required');

  const currentIteration = sortedScenarioIterations.find(
    ({ id }) => id === toUUID(iterationId)
  );
  invariant(currentIteration, 'currentIteration is required');

  return (
    <ScenarioPage.Container>
      <ScenarioPage.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Link to={getRoute('/scenarios')}>
            <ScenarioPage.BackButton />
          </Link>
          {currentScenario.name}
          <VersionSelect
            scenarioIterations={sortedScenarioIterations}
            currentIteration={currentIteration}
          />
        </div>
        <DeploymentModal
          scenarioId={currentScenario.id}
          liveVersionId={currentScenario.liveVersionId}
          currentIteration={currentIteration}
        />
      </ScenarioPage.Header>
      <ScenarioPage.Content>
        <Scenarios.Nav>
          {LINKS.map((linkProps) => (
            <li key={linkProps.labelTKey}>
              <Scenarios.Link {...linkProps} />
            </li>
          ))}
        </Scenarios.Nav>
        <Outlet />
      </ScenarioPage.Content>
    </ScenarioPage.Container>
  );
}

function VersionSelect({
  currentIteration,
  scenarioIterations,
}: {
  currentIteration: SortedScenarioIteration;
  scenarioIterations: SortedScenarioIteration[];
}) {
  const { t } = useTranslation(handle.i18n);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Select.Default
      value={currentIteration.id}
      border="rounded"
      className="min-w-[126px]"
      onValueChange={(selectedId) => {
        const elem = scenarioIterations.find(({ id }) => id === selectedId);
        if (!elem?.id) return;
        navigate(
          location.pathname.replace(
            fromUUID(currentIteration.id),
            fromUUID(elem?.id)
          )
        );
      }}
    >
      {scenarioIterations.map((iteration) => {
        return (
          <Select.DefaultItem
            className="min-w-[110px]"
            key={iteration.id}
            value={iteration.id}
          >
            <p className="text-s flex flex-row gap-1 font-semibold">
              <span className="text-grey-100 capitalize">
                {iteration.version
                  ? `V${iteration.version}`
                  : t('scenarios:draft')}
              </span>
              {iteration.type === 'live version' && (
                <span className="capitalize text-purple-100">
                  {t('scenarios:live')}
                </span>
              )}
            </p>
          </Select.DefaultItem>
        );
      })}
    </Select.Default>
  );
}
