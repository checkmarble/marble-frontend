import {
  createOrganizationUser,
  listOrganizationFeatures,
  listOrganizationUsersQueryOptions,
} from '@bo/data/organization';
import { FeatureValue } from '@bo/schemas/features';
import { CreateUserPayload, createUserPayloadSchema, USER_ROLES } from '@bo/schemas/user';
import { AnyFieldApi, useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FeatureAccessDto } from 'marble-api/generated/backoffice-api';
import { ChangeEvent, useState } from 'react';
import { Button, Collapsible, HeadlessCollapsible, Input, Modal, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';
import { GridContentLoader } from '../common/GridContentLoader';
import { SuspenseQuery } from '../core/SuspenseQuery';

const ErrorComponent = ({ error, reset }: { error: any; reset: () => void }) => {
  return (
    <div className="col-span-full p-v2-lg flex flex-col gap-v2-md items-center">
      <span>Something went wrong while fetching organization users</span>
      <Button variant="secondary" onClick={() => reset()}>
        Retry
      </Button>
    </div>
  );
};

// TODO: Move this helper out
const getAvailableUserRoles = (featureValue: FeatureAccessDto['roles'] | undefined) => {
  if (!featureValue) return [];

  return featureValue === 'restricted' ? (['ADMIN'] as const) : USER_ROLES;
};

export const OrganizationUsersPage = ({ orgId }: { orgId: string }) => {
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const handleCreateUser = () => {
    setIsCreatingUser(true);
  };

  return (
    <div className="flex flex-col gap-v2-md">
      <div className="flex items-center justify-between">
        <h2 className="text-h2">Users</h2>
        <Button variant="primary" onClick={handleCreateUser}>
          <Icon icon="plus" className="size-4" />
          Add User
        </Button>
      </div>
      <div className="grid grid-cols-[1fr_repeat(4,auto)] bg-surface-card border border-grey-border rounded-v2-md">
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
                <div
                  key={user.user_id}
                  className="grid grid-cols-subgrid col-span-full items-center hover:bg-surface-row-hover"
                >
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
      <UserCreationModal orgId={orgId} open={isCreatingUser} onOpenChange={setIsCreatingUser} />
    </div>
  );
};

// TODO: Move this to shared
const handleChange = (field: AnyFieldApi) => {
  return (e: ChangeEvent<HTMLInputElement>) => {
    field.handleChange(e.target.value);
  };
};

const UserCreationModal = ({
  orgId,
  open,
  onOpenChange,
}: {
  orgId: string;
  open: boolean;
  onOpenChange: (state: boolean) => void;
}) => {
  const createOrganizationUserMutation = useMutation({
    ...createOrganizationUser(),
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const form = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      role: '' as unknown as CreateUserPayload['role'],
    } as CreateUserPayload,
    validators: {
      onSubmit: createUserPayloadSchema,
      onChange: createUserPayloadSchema,
      onMount: createUserPayloadSchema,
    },
    onSubmit: ({ value, formApi }) => {
      console.log('SUBMITTING');
      if (formApi.state.isValid) {
        createOrganizationUserMutation.mutateAsync({ orgId, userPayload: value });
      }
    },
  });
  const orgFeaturesAccessQuery = useQuery(listOrganizationFeatures(orgId));

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Title>Create new user</Modal.Title>
        <form
          id="create-user-form"
          className="grid grid-cols-2 gap-v2-md p-v2-md"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="first_name">
            {(field) => (
              <div className="flex flex-col gap-v2-xs">
                <label>First name</label>
                <Input name={field.name} value={field.state.value} onChange={handleChange(field)} />
              </div>
            )}
          </form.Field>
          <form.Field name="last_name">
            {(field) => (
              <div className="flex flex-col gap-v2-xs">
                <label>Last name</label>
                <Input name={field.name} value={field.state.value} onChange={handleChange(field)} />
              </div>
            )}
          </form.Field>
          <form.Field name="email">
            {(field) => (
              <div className="flex flex-col gap-v2-xs col-span-full">
                <label htmlFor={field.name}>Email</label>
                <Input id={field.name} name={field.name} value={field.state.value} onChange={handleChange(field)} />
              </div>
            )}
          </form.Field>
          <form.Field name="role">
            {(field) => (
              <div className="flex flex-col gap-v2-xs col-span-full">
                <label>Role</label>
                <SelectV2<CreateUserPayload['role']>
                  disabled={!orgFeaturesAccessQuery.isSuccess}
                  placeholder="Role"
                  value={field.state.value}
                  onChange={field.handleChange}
                  options={getAvailableUserRoles(orgFeaturesAccessQuery.data?.roles).map((r) => ({
                    value: r,
                    label: r,
                  }))}
                />
              </div>
            )}
          </form.Field>
        </form>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Modal.Close>
          <form.Subscribe selector={(s) => [s.canSubmit]}>
            {([canSubmit]) => (
              <>
                <Button type="submit" variant="primary" disabled={!canSubmit} form="create-user-form">
                  Save
                </Button>
                <Button variant="primary" disabled={!canSubmit}>
                  Save and Add new
                </Button>
              </>
            )}
          </form.Subscribe>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
