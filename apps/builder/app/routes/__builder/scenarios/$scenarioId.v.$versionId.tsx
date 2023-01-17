import { Page } from '@marble-front/builder/components/Page';
import {
  useCurrentScenario,
  useCurrentScenarioVersion,
} from '@marble-front/builder/hooks/scenarios';
import { createScenario } from '@marble-front/builder/services/business-logic';
import { fromUUID } from '@marble-front/builder/utils/short-uuid';
import { Select } from '@marble-front/ui/design-system';
import { Link, Outlet, useLocation, useNavigate } from '@remix-run/react';
import * as R from 'remeda';

export default function ScenarioLayout() {
  const scenario = createScenario(useCurrentScenario());
  const currentScenarioVersion = useCurrentScenarioVersion();
  const navigate = useNavigate();
  const location = useLocation();

  const scenarioVersions = R.pipe(
    scenario.versions,
    R.sortBy<typeof scenario.versions[number]>([
      ({ creationDate }) => creationDate,
      'desc',
    ]),
    //TODO(scenario): remove this to use version from model
    R.map.indexed((version, index) => ({
      ...version,
      versionLabel: `V${scenario.versions.length - index} (${
        version.creationDate
      })`,
    }))
  );

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
                location.pathname.replace(
                  fromUUID(currentScenarioVersion.id),
                  fromUUID(versionId)
                )
              );
            }}
          >
            {scenarioVersions.map(({ id, versionLabel }, index) => {
              return (
                <Select.DefaultItem key={id} value={id}>
                  <p className="text-text-s-semibold-cta flex flex-row gap-1">
                    <span className="text-grey-100">{versionLabel}</span>
                    {id === scenario.lastDeployment?.scenarioVersionId && (
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
