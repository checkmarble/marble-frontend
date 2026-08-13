import { getGraphEligiblePivots } from '@app-builder/components/CaseManager/graph-pivots';
import { CommentContext } from '@app-builder/components/CaseManager/hooks/comment-context';
import { getPivotObjectKey } from '@app-builder/models/cases';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/links')({
  component: RouteComponent,
});

function RouteComponent() {
  const { pivotObjects, dataModel } = Route.useRouteContext();
  const { t } = useTranslation(['cases']);
  const { set } = CommentContext.useValue();
  const eligiblePivots = getGraphEligiblePivots(pivotObjects, dataModel);

  useEffect(() => {
    set(null);
  }, [set]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {eligiblePivots.length > 1 ? (
        <div className="mb-lg flex shrink-0 gap-sm">
          {eligiblePivots.map((p) => {
            const index = pivotObjects.findIndex((candidate) => getPivotObjectKey(candidate) === getPivotObjectKey(p));
            return (
              <Link
                key={getPivotObjectKey(p)}
                className="px-sm h-8 rounded-md border border-grey-border flex items-center aria-[current=page]:border-purple-primary"
                from="/cases/s/$caseId/"
                to="./links/$pivotValue"
                params={{ pivotValue: getPivotObjectKey(p) }}
              >
                {t('cases:case_manager.client_panel.label', { index: index + 1 })}
              </Link>
            );
          })}
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
