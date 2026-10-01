import { getGraphEligibleClients } from '@app-builder/components/CaseManager/graph-pivots';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/links/')({
  beforeLoad: async ({ context }) => {
    const { caseClients, dataModel } = context;
    const first = getGraphEligibleClients(caseClients, dataModel)[0];

    if (first) {
      throw redirect({
        from: '/cases/s/$caseId/links',
        to: './$pivotValue',
        params: { pivotValue: first.key },
      });
    }

    throw redirect({ from: '/cases/s/$caseId/', to: './principal' });
  },
});
