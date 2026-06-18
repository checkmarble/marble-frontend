import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/_new/clients')({
  component: RouteComponent,
});

function RouteComponent() {
  const { pivotObjects } = Route.useRouteContext();
  const { t } = useTranslation(['cases']);

  return (
    <>
      {pivotObjects.length > 1 ? (
        <div className="flex gap-sm mb-lg">
          {pivotObjects.map((p, i) => (
            <Link
              key={p.pivotValue}
              className="px-sm h-8 rounded-md border border-grey-border flex items-center aria-[current=page]:border-purple-primary"
              from="/cases/s/$caseId/"
              to="./clients/$pivotValue"
              params={{ pivotValue: p.pivotValue }}
            >
              {t('cases:case_manager.client_panel.label', { index: i + 1 })}
            </Link>
          ))}
        </div>
      ) : null}
      <Outlet />
    </>
  );
}
