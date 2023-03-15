import {
  navigationI18n,
  ScenarioPage,
  Scenarios,
  type ScenariosLinkProps,
} from '@marble-front/builder/components';
import {
  type Increment,
  type Increments,
  useCurrentScenario,
} from '@marble-front/builder/routes/__builder/scenarios/$scenarioId';
import { DeploymentModal } from '@marble-front/builder/routes/ressources/scenarios/deployment';
import { getRoute } from '@marble-front/builder/services/routes';
import { fromUUID, toUUID } from '@marble-front/builder/utils/short-uuid';
import { Select } from '@marble-front/ui/design-system';
import { Decision, Rules, Trigger } from '@marble-front/ui/icons';
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';

export const handle = {
  i18n: [...navigationI18n, 'scenarios', 'common'] as const,
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

export default function ScenarioViewLayout() {
  const {
    name,
    increments,
    id: scenarioId,
    liveVersion,
  } = useCurrentScenario();

  const { incrementId } = useParams();
  invariant(incrementId, 'incrementId is required');

  const currentIncrement = increments.get(toUUID(incrementId));
  invariant(currentIncrement, 'currentIncrement is required');

  return (
    <ScenarioPage.Container>
      <ScenarioPage.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Link to={getRoute('/scenarios')}>
            <ScenarioPage.BackButton />
          </Link>
          {name}
          <VersionSelect
            increments={increments}
            currentIncrement={currentIncrement}
          />
        </div>
        <DeploymentModal
          scenarioId={scenarioId}
          liveVersionId={liveVersion?.scenarioVersionId}
          currentIncrement={currentIncrement}
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
  currentIncrement,
  increments,
}: {
  currentIncrement: Increment;
  increments: Increments;
}) {
  const { t } = useTranslation(handle.i18n);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Select.Default
      value={currentIncrement.id}
      border="rounded"
      className="min-w-[126px]"
      onValueChange={(id) => {
        const elem = increments.get(id);
        if (!elem?.id) return;
        navigate(
          location.pathname.replace(
            fromUUID(currentIncrement.id),
            fromUUID(elem?.id)
          )
        );
      }}
    >
      {increments.values.map((increment) => {
        return (
          <Select.DefaultItem
            className="min-w-[110px]"
            key={increment.id}
            value={increment.id}
          >
            <p className="text-s flex flex-row gap-1 font-semibold">
              <span className="text-grey-100 capitalize">
                {increment.type === 'draft'
                  ? t('scenarios:draft')
                  : increment.label}
              </span>
              {increment.type === 'live version' && (
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
