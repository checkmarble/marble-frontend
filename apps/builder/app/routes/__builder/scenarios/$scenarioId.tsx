import { Page } from '@marble-front/builder/components/Page';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import type { Scenario } from '@marble-front/api/marble';

import { faker } from '@faker-js/faker';
import type { PlainMessage } from '@bufbuild/protobuf';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';

function getFakeScenario(id: string): PlainMessage<Scenario> {
  const versions = Array.from({ length: Math.floor(Math.random() * 10) }).map(
    (_) => ({
      id: faker.database.mongodbObjectId(),
      rules: [],
    })
  );

  return {
    id,
    name: faker.name.fullName(),
    description: faker.lorem.sentences(),
    mainTable: faker.name.lastName(),
    versions,
    activeVersion: versions?.[versions?.length - 1],
  };
}

export async function loader({ request, params }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  invariant(params.scenarioId, `params.scenarioId is required`);
  /** TODO(data): get scenario from API */
  const scenario = getFakeScenario(params.scenarioId);

  return json(scenario);
}

export default function ScenarioLayout() {
  const data = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Header>
        <Link to="./..">
          <Page.BackButton className="mr-4" />
        </Link>
        {data.name}
      </Page.Header>
      <Outlet />
    </Page.Container>
  );
}
