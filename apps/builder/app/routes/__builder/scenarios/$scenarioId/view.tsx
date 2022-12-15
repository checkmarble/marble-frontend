import { Page } from '@marble-front/builder/components/Page';
import { Outlet } from '@remix-run/react';
import { Decision, Rules, Trigger } from '@marble-front/ui/icons';
import {
  type ScenariosLinkProps,
  Scenarios,
  navigationI18n,
} from '@marble-front/builder/components/Navigation';

export const handle = {
  i18n: [...navigationI18n],
};

const LINKS: ScenariosLinkProps[] = [
  { labelTKey: 'scenario.trigger', to: './trigger', Icon: Trigger },
  { labelTKey: 'scenario.rules', to: './rules', Icon: Rules },
  { labelTKey: 'scenario.decision', to: './decision', Icon: Decision },
];

export default function ScenarioLayout() {
  return (
    <Page.Content>
      <Scenarios.Nav className="pb-8">
        {LINKS.map((linkProps) => (
          <li key={linkProps.labelTKey}>
            <Scenarios.Link {...linkProps} />
          </li>
        ))}
      </Scenarios.Nav>
      <Outlet />
    </Page.Content>
  );
}
