import {
  navigationI18n,
  ScenarioPage,
  Scenarios,
  type ScenariosLinkProps,
} from '@marble-front/builder/components';
import { useCurrentScenario } from '@marble-front/builder/routes/__builder/scenarios/$scenarioId';
import { getRoute } from '@marble-front/builder/services/routes';
import { Tag } from '@marble-front/ui/design-system';
import { Decision, Rules, Trigger } from '@marble-front/ui/icons';
import { Link, Outlet } from '@remix-run/react';
import { type Namespace } from 'i18next';

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

export default function ScenarioViewLayout() {
  const currentScenario = useCurrentScenario();

  return (
    <ScenarioPage.Container>
      <ScenarioPage.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Link to={getRoute('/scenarios')}>
            <ScenarioPage.BackButton />
          </Link>
          {currentScenario.name}
          <Tag size="big" border="square">
            Edit
          </Tag>
        </div>
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
