import { makeQueryErrorComponent } from '@bo/components/common/ErrorComponent';
import { GridContentLoader } from '@bo/components/common/GridContentLoader';
import { SuspenseQuery } from '@bo/components/core/SuspenseQuery';
import {
  createOrganizationUser,
  listOrganizationFeatures,
  listOrganizationUsersQueryOptions,
} from '@bo/data/organization';
import { CreateUserPayload, createUserPayloadSchema, USER_ROLES } from '@bo/schemas/user';
import { AnyFieldApi, useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FeatureAccessDto } from 'marble-api/generated/backoffice-api';
import { ChangeEvent, useState } from 'react';
import { Button, Input, Modal, SelectV2, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';

const ErrorComponent = makeQueryErrorComponent(<span>Something went wrong while fetching organization users</span>);

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
    <div className="flex flex-col gap-md">
      <div className="flex items-center justify-between">
        <Typo variant="title2">Users</Typo>
        <Button variant="primary" size="medium" onClick={handleCreateUser}>
          <Icon icon="plus" className="size-4" />
          Add User
        </Button>
      </div>
      <div className="grid grid-cols-[1fr_repeat(4,auto)] bg-surface-card border border-grey-border rounded-md">
        <div className="grid grid-cols-subgrid col-span-full border-b border-grey-border items-center font-medium">
          <div className="p-md">Name</div>
          <div className="p-md">ID</div>
          <div className="p-md">Email</div>
          <div className="p-md">Role</div>
          <div className="p-md">Actions</div>
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
                  <div className="p-md">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="p-md">{user.user_id}</div>
                  <div className="p-md">{user.email}</div>
                  <div className="p-md">{user.role}</div>
                  <div className="p-md"></div>
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
          className="grid grid-cols-2 gap-md p-md"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="first_name">
            {(field) => (
              <div className="flex flex-col gap-xs">
                <label>First name</label>
                <Input name={field.name} value={field.state.value} onChange={handleChange(field)} />
              </div>
            )}
          </form.Field>
          <form.Field name="last_name">
            {(field) => (
              <div className="flex flex-col gap-xs">
                <label>Last name</label>
                <Input name={field.name} value={field.state.value} onChange={handleChange(field)} />
              </div>
            )}
          </form.Field>
          <form.Field name="email">
            {(field) => (
              <div className="flex flex-col gap-xs col-span-full">
                <label htmlFor={field.name}>Email</label>
                <Input id={field.name} name={field.name} value={field.state.value} onChange={handleChange(field)} />
              </div>
            )}
          </form.Field>
          <form.Field name="role">
            {(field) => (
              <div className="flex flex-col gap-xs col-span-full">
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
          <Modal.FooterButton isCloseButton label="Cancel" />
          <form.Subscribe selector={(s) => [s.canSubmit]}>
            {([canSubmit]) => (
              <>
                <Modal.FooterButton
                  label="Save"
                  type="submit"
                  variant="primary"
                  disabled={!canSubmit}
                  form="create-user-form"
                />
                <Modal.FooterButton
                  label="Save and Add new"
                  type="submit"
                  variant="primary"
                  disabled={!canSubmit}
                  form="create-user-form"
                />
              </>
            )}
          </form.Subscribe>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
