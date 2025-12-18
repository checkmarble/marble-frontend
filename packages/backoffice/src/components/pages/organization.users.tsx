import { makeQueryErrorComponent } from '@bo/components/common/ErrorComponent';
import { GridContentLoader } from '@bo/components/common/GridContentLoader';
import { SuspenseQuery } from '@bo/components/core/SuspenseQuery';
import {
  listOrganizationFeatures,
  listOrganizationUsersQueryOptions,
  useCreateOrganizationUserMutationOptions,
} from '@bo/data/organization';
import { CreateUserPayload, createUserPayloadSchema, DUPLICATE_EMAIL_ERROR, USER_ROLES } from '@bo/schemas/user';
import { AnyFieldApi, useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FeatureAccessDto } from 'marble-api/generated/backoffice-api';
import { ChangeEvent, useRef, useState } from 'react';
import toast from 'react-hot-toast';
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

const FORM_ID = 'create-user-form';

type SubmitIntent = 'save' | 'saveAndNew';

const getCreateUserErrorMessage = (error: unknown) =>
  error instanceof Error && error.message === DUPLICATE_EMAIL_ERROR
    ? 'A user with this email already exists'
    : 'Something went wrong while creating the user';

const UserCreationModal = ({
  orgId,
  open,
  onOpenChange,
}: {
  orgId: string;
  open: boolean;
  onOpenChange: (state: boolean) => void;
}) => {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Title>Create new user</Modal.Title>
        {/* Radix unmounts the content while closed, so keeping the form state in a child
            component guarantees a clean form on every open. */}
        <UserCreationForm orgId={orgId} onClose={() => onOpenChange(false)} />
      </Modal.Content>
    </Modal.Root>
  );
};

const UserCreationForm = ({ orgId, onClose }: { orgId: string; onClose: () => void }) => {
  const firstNameRef = useRef<HTMLInputElement>(null);
  const [pendingIntent, setPendingIntent] = useState<SubmitIntent | null>(null);

  const createOrganizationUserMutationOptions = useCreateOrganizationUserMutationOptions();
  const createOrganizationUserMutation = useMutation({
    ...createOrganizationUserMutationOptions,
    onSuccess: (_user, variables) => {
      toast.success(`User ${variables.userPayload.email} created`);
    },
    onError: (error) => {
      toast.error(getCreateUserErrorMessage(error));
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
    onSubmitMeta: { keepOpen: false },
    onSubmit: async ({ value, formApi, meta }) => {
      if (!formApi.state.isValid) return;

      setPendingIntent(meta.keepOpen ? 'saveAndNew' : 'save');
      try {
        await createOrganizationUserMutation.mutateAsync({ orgId, userPayload: value });
      } catch {
        // The error toast is raised by the mutation's onError. Keep the form as-is so the
        // user can fix the input and retry.
        return;
      } finally {
        setPendingIntent(null);
      }

      if (!meta.keepOpen) {
        onClose();
        return;
      }

      formApi.reset();
      // reset() clears the whole errorMap, which would leave canSubmit true on an empty
      // form; re-running the onMount validator restores the disabled state.
      formApi.validateSync('mount');
      firstNameRef.current?.focus();
    },
  });
  const orgFeaturesAccessQuery = useQuery(listOrganizationFeatures(orgId));

  return (
    <>
      <form
        id={FORM_ID}
        className="grid grid-cols-2 gap-md p-md"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // No meta => the onSubmitMeta default ({ keepOpen: false }) => save and close.
          void form.handleSubmit();
        }}
      >
        <form.Field name="first_name">
          {(field) => (
            <div className="flex flex-col gap-xs">
              <label htmlFor={field.name}>First name</label>
              <Input
                ref={firstNameRef}
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={handleChange(field)}
              />
            </div>
          )}
        </form.Field>
        <form.Field name="last_name">
          {(field) => (
            <div className="flex flex-col gap-xs">
              <label htmlFor={field.name}>Last name</label>
              <Input id={field.name} name={field.name} value={field.state.value} onChange={handleChange(field)} />
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
        <Modal.FooterButton isCloseButton label="Cancel" disabled={pendingIntent !== null} />
        <form.Subscribe selector={(s) => s.canSubmit}>
          {(canSubmit) => (
            <>
              {/* "Save" keeps type="submit" so it stays the form's default button: with three
                  text inputs, Enter-key implicit submission only works if one exists. */}
              <Modal.FooterButton
                label="Save"
                type="submit"
                variant="primary"
                disabled={!canSubmit || pendingIntent !== null}
                isLoading={pendingIntent === 'save'}
                form={FORM_ID}
              />
              <Modal.FooterButton
                label="Save and Add new"
                type="button"
                variant="primary"
                disabled={!canSubmit || pendingIntent !== null}
                isLoading={pendingIntent === 'saveAndNew'}
                onClick={() => void form.handleSubmit({ keepOpen: true })}
              />
            </>
          )}
        </form.Subscribe>
      </Modal.Footer>
    </>
  );
};
