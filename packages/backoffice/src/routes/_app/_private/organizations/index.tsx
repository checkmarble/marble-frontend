import { OrganizationsPage } from '@bo/components/pages/organizations';
import { listOrganizationsQueryOptions } from '@bo/data/organization';
import { noop } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_private/organizations/')({
  component: OrganizationsPage,
  loader: ({ context }) => {
    context.queryClient.query(listOrganizationsQueryOptions()).catch(noop);
  },
});
