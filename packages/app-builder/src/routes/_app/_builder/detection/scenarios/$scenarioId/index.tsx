import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/detection/scenarios/$scenarioId/')({
  beforeLoad: ({ params }) => {
    const { scenarioId } = params;
    throw redirect({
      to: '/detection/scenarios/$scenarioId/home',
      params: { scenarioId },
    });
  },
});
