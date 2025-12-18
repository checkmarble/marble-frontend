import { LicensesPage } from '@bo/components/pages/licenses';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_private/licenses/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <LicensesPage />;
}
