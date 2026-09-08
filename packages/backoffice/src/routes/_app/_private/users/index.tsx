import { ErrorComponent } from '@bo/components/common/ErrorComponent';
import { UsersPage } from '@bo/components/pages/users';
import { listUsersQueryOptions } from '@bo/data/users';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_private/users/')({
  component: UsersPage,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(listUsersQueryOptions());
  },
  errorComponent: () => {
    return <ErrorComponent message="Something went wrong while fetching users" />;
  },
});
