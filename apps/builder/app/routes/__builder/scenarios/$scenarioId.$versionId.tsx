import { Page } from '@marble-front/builder/components/Page';
import {
  useCurrentScenario,
  useCurrentScenarioVersion,
} from '@marble-front/builder/hooks/scenarios';
import { Select } from '@marble-front/ui/design-system';
import { Link, Outlet, useLocation, useNavigate } from '@remix-run/react';

export default function ScenarioLayout() {
  const scenario = useCurrentScenario();
  const currentScenarioVersion = useCurrentScenarioVersion();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Link to="./..">
            <Page.BackButton />
          </Link>
          {scenario.name}
          <Select.Default
            defaultValue={currentScenarioVersion.id}
            border="rounded"
            className="min-w-[126px]"
            onValueChange={(versionId) => {
              navigate(
                location.pathname.replace(currentScenarioVersion.id, versionId)
              );
            }}
          >
            {scenario.versions.map(({ id }, index) => {
              return (
                <Select.DefaultItem key={id} value={id}>
                  <p className="text-text-s-semibold-cta flex flex-row gap-1">
                    <span className="text-grey-100">{`V${index}`}</span>
                    {id === scenario.activeVersion?.id && (
                      <span className="text-purple-100">Live</span>
                    )}
                  </p>
                </Select.DefaultItem>
              );
            })}
          </Select.Default>
        </div>
      </Page.Header>
      <Outlet />
    </Page.Container>
  );
}
