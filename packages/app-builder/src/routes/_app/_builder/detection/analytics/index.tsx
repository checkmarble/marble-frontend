import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const analyticsIndexLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function analyticsIndexLoader({ context }) {
    const { scenario } = context.authInfo;

    const scenarios = await scenario.listScenarios();
    const firstScenario = scenarios[0];

    if (firstScenario) {
      throw redirect({
        to: '/detection/analytics/$scenarioId',
        params: { scenarioId: fromUUIDtoSUUID(firstScenario.id) },
      });
    }

    throw redirect({ to: '/detection/scenarios' });
  });

export const Route = createFileRoute('/_app/_builder/detection/analytics/')({
  loader: () => analyticsIndexLoader(),
  component: () => null,
});
