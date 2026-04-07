import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/detection/scenarios/$scenarioId/i/$iterationId/trigger',
      params: { scenarioId: params.scenarioId, iterationId: params.iterationId },
    });
  },
});
