import { ErrorComponent } from '@bo/components/common/ErrorComponent';
import { TenantsPage } from '@bo/components/pages/tenants';
import { listOrganizationsQueryOptions } from '@bo/data/organization';
import { listTenantsQueryOptions } from '@bo/data/tenants';
import { noop } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_private/tenants/')({
  component: TenantsPage,
  loader: ({ context }) => {
    context.queryClient.query(listTenantsQueryOptions()).catch(noop);
    context.queryClient.query(listOrganizationsQueryOptions()).catch(noop);
  },
  errorComponent: () => {
    return <ErrorComponent message="Something went wrong while fetching tenants" />;
  },
});
