import { getPivotObjectKey } from '@app-builder/models/cases';
import { createFileRoute, notFound, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/_new/clients/')({
  beforeLoad: async ({ context }) => {
    const { pivotObjects } = context;

    if (pivotObjects.length > 0 && pivotObjects[0]) {
      throw redirect({
        from: '/cases/s/$caseId/clients',
        to: './$pivotValue',
        params: { pivotValue: getPivotObjectKey(pivotObjects[0]) },
      });
    }

    throw notFound();
  },
});
