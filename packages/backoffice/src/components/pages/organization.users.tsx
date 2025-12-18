import { listOrganizationUsersQueryOptions } from '@bo/data/organization';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { GridContentLoader } from '../common/GridContentLoader';
import { SuspenseQuery } from '../core/SuspenseQuery';

const ErrorComponent = ({ error, reset }: { error: any; reset: () => void }) => {
  return (
    <div className="col-span-full p-v2-lg flex flex-col gap-v2-md items-center">
      <span>Something went wrong while fetching organization users</span>
      <ButtonV2 variant="secondary" onClick={() => reset()}>
        Retry
      </ButtonV2>
    </div>
  );
};

export const OrganizationUsersPage = ({ orgId }: { orgId: string }) => {
  return (
    <div className="flex flex-col gap-v2-md">
      <div className="flex items-center justify-between">
        <h2 className="text-h2">Users</h2>
        <ButtonV2 variant="primary">
          <Icon icon="plus" className="size-4" />
          Add User
        </ButtonV2>
      </div>
      <div className="grid grid-cols-[1fr_repeat(4,auto)] border border-grey-border rounded-v2-md">
        <div className="grid grid-cols-subgrid col-span-full border-b border-grey-border items-center font-medium">
          <div className="p-v2-md">Name</div>
          <div className="p-v2-md">ID</div>
          <div className="p-v2-md">Email</div>
          <div className="p-v2-md">Role</div>
          <div className="p-v2-md">Actions</div>
        </div>
        <SuspenseQuery
          query={listOrganizationUsersQueryOptions(orgId)}
          fallback={<GridContentLoader />}
          errorComponent={ErrorComponent}
        >
          {(users) => (
            <>
              {users.map((user) => (
                <div key={user.user_id} className="grid grid-cols-subgrid col-span-full items-center">
                  <div className="p-v2-md">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="p-v2-md">{user.user_id}</div>
                  <div className="p-v2-md">{user.email}</div>
                  <div className="p-v2-md">{user.role}</div>
                  <div className="p-v2-md"></div>
                </div>
              ))}
            </>
          )}
        </SuspenseQuery>
      </div>
    </div>
  );
};
