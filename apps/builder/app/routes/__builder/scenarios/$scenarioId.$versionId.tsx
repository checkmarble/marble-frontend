import { Page } from '@marble-front/builder/components/Page';
import { useCurrentScenario } from '@marble-front/builder/hooks/scenarios';
import { Link, Outlet } from '@remix-run/react';

export default function ScenarioLayout() {
  const scenario = useCurrentScenario();

  return (
    <Page.Container>
      <Page.Header>
        <Link to="./..">
          <Page.BackButton className="mr-4" />
        </Link>
        {scenario.name}
      </Page.Header>
      <Outlet />
    </Page.Container>
  );
}
