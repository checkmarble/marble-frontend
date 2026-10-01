import { createFileRoute, notFound, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/clients/')({
  beforeLoad: async ({ context }) => {
    const firstClient = context.caseClients[0];

    if (firstClient) {
      throw redirect({
        from: '/cases/s/$caseId/clients',
        to: './$pivotValue',
        params: { pivotValue: firstClient.key },
      });
    }

    throw notFound();
  },
});
