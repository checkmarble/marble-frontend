import { ErrorComponent } from '@bo/components/common/ErrorComponent';
import { UsersPage } from '@bo/components/pages/users';
import { listUsersQueryOptions } from '@bo/data/users';
import { noop } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_private/users/')({
  component: UsersPage,
  loader: ({ context }) => {
    context.queryClient.query(listUsersQueryOptions()).catch(noop);
  },
  errorComponent: () => {
    return <ErrorComponent message="Something went wrong while fetching users" />;
  },
});
