import type { LoaderArgs, SerializeFrom } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { scenariosApi } from '@marble-front/builder/services/marble-api/scenarios.server';
import { ScenarioVersionBody } from '@marble-front/api/marble';

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const scenarios = await scenariosApi.getScenarios({ userId: user.id });

  /**
   * Decode the protobuf body on the server, using Buffer.from
   *
   * In case we need to decode on the browser, use abab package :
   * - robust implementation of atob / btoa
   * - same logic on browser and nodejs server (to ensure SSR consistance)
   */
  const decodedScenarios = scenarios.map((scenario) => ({
    ...scenario,
    versions: scenario.versions.map(
      ({ bodyEncodedWithProtobuf, ...version }) => {
        const scenarioVersionBody = ScenarioVersionBody.fromBinary(
          Buffer.from(bodyEncodedWithProtobuf, 'base64')
        );

        return { ...version, body: { ...scenarioVersionBody } };
      }
    ),
  }));

  return json(decodedScenarios);
}

export default function ScenariosPage() {
  return <Outlet />;
}

export type ScenariosLoaderData = SerializeFrom<typeof loader>;
