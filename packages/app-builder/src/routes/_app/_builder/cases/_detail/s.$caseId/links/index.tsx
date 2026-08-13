import { getGraphEligiblePivots } from '@app-builder/components/CaseManager/graph-pivots';
import { getPivotObjectKey } from '@app-builder/models/cases';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/links/')({
  beforeLoad: async ({ context }) => {
    const { pivotObjects, dataModel } = context;
    const eligiblePivots = getGraphEligiblePivots(pivotObjects ?? [], dataModel);
    const first = eligiblePivots[0];

    if (first) {
      throw redirect({
        from: '/cases/s/$caseId/links',
        to: './$pivotValue',
        params: { pivotValue: getPivotObjectKey(first) },
      });
    }

    throw redirect({ from: '/cases/s/$caseId/', to: './principal' });
  },
});
