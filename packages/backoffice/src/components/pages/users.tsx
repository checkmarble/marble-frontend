import { makeQueryErrorComponent } from '@bo/components/common/ErrorComponent';
import { SuspenseQuery } from '@bo/components/core/SuspenseQuery';
import {
  listUsersQueryOptions,
  useCreateGlobalUserMutationOptions,
  useUpdateGlobalUserMutationOptions,
} from '@bo/data/users';
import {
  type CreateGlobalUserPayload,
  createGlobalUserPayloadSchema,
  DUPLICATE_EMAIL_ERROR,
  GLOBAL_USER_ROLES,
  type UpdateGlobalUserPayload,
  updateGlobalUserPayloadSchema,
} from '@bo/schemas/user';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import type { UserDto } from 'marble-api/generated/marblecore-api';
import { type ReactNode, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Input, Panel, SelectV2, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';

const UsersError = makeQueryErrorComponent(<span className="text-grey-secondary text-s">Could not load users.</span>);

type PanelState = { mode: 'create' } | { mode: 'edit'; user: UserDto } | null;

export function UsersPage() {
  const [panel, setPanel] = useState<PanelState>(null);

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div className="flex max-w-2xl flex-col gap-xs">
          <Typo variant="title1">Users</Typo>
          <p className="text-grey-secondary text-s">
            Provision and maintain users across Marble, including accounts that are not assigned to an organization.
          </p>
        </div>
        <Button size="large" variant="primary" onClick={() => setPanel({ mode: 'create' })}>
          <Icon icon="plus" className="size-4" />
          Create user
        </Button>
      </div>

      <SuspenseQuery query={listUsersQueryOptions()} fallback={<UsersSkeleton />} errorComponent={UsersError}>
        {(users) => <UsersList users={users} onEdit={(user) => setPanel({ mode: 'edit', user })} />}
      </SuspenseQuery>

      <UserPanel state={panel} onOpenChange={(open) => (open ? undefined : setPanel(null))} />
    </div>
  );
}

function UsersList({ users, onEdit }: { users: UserDto[]; onEdit: (user: UserDto) => void }) {
  const [search, setSearch] = useState('');
  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => {
      const name = `${user.first_name} ${user.last_name}`.toLowerCase();
      return name.includes(term) || user.email.toLowerCase().includes(term);
    });
  }, [search, users]);

  if (users.length === 0) {
    return <EmptyState title="No users yet" body="Create a user to manage access across Marble." />;
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="max-w-100">
        <Input
          startAdornment="search"
          endAdornment={search ? 'cross' : undefined}
          onEndAdornmentClick={() => setSearch('')}
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          aria-label="Search users"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState title="No matches" body={`No user matches “${search.trim()}”.`} />
      ) : (
        <div className="border-grey-border bg-surface-card overflow-hidden rounded-lg border">
          <div className="border-grey-border text-grey-secondary hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.25fr)_auto] gap-md border-b px-md py-sm text-xs font-semibold uppercase tracking-wider lg:grid">
            <span>User</span>
            <span>Role</span>
            <span>Organization</span>
            <span className="sr-only">Actions</span>
          </div>
          <ul className="divide-grey-border divide-y">
            {filteredUsers.map((user) => (
              <UserRow key={user.user_id} user={user} onEdit={() => onEdit(user)} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function UserRow({ user, onEdit }: { user: UserDto; onEdit: () => void }) {
  return (
    <li className="grid grid-cols-1 gap-md px-md py-md lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.25fr)_auto] lg:items-center">
      <div className="flex min-w-0 flex-col gap-2xs">
        <span className="text-grey-primary truncate text-s font-medium">
          {user.first_name} {user.last_name}
        </span>
        <span className="text-grey-secondary truncate text-xs">{user.email}</span>
        <span className="text-grey-placeholder truncate font-mono text-2xs">{user.user_id}</span>
      </div>
      <div className="flex items-center gap-sm lg:block">
        <span className="text-grey-secondary text-xs font-medium lg:sr-only">Role</span>
        <Tag color="grey" size="small">
          {user.role}
        </Tag>
      </div>
      <div className="flex min-w-0 flex-col gap-2xs">
        <span className="text-grey-secondary text-xs font-medium lg:sr-only">Organization</span>
        {user.organization_id !== '00000000-0000-0000-0000-000000000000' ? (
          <span className="text-grey-secondary truncate font-mono text-xs">{user.organization_id}</span>
        ) : (
          <span className="text-grey-secondary text-s">Unassigned</span>
        )}
      </div>
      <div className="lg:justify-self-end">
        <Button variant="secondary" size="small" onClick={onEdit}>
          <Icon icon="edit-square" className="size-4" />
          Edit
        </Button>
      </div>
    </li>
  );
}

function UserPanel({ state, onOpenChange }: { state: PanelState; onOpenChange: (open: boolean) => void }) {
  return (
    <Panel.Root open={state !== null} onOpenChange={onOpenChange}>
      <Panel.Container size="medium">
        <Panel.Content>
          {state?.mode === 'create' ? <CreateUserPanel onClose={() => onOpenChange(false)} /> : null}
          {state?.mode === 'edit' ? <EditUserPanel user={state.user} onClose={() => onOpenChange(false)} /> : null}
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
}

function CreateUserPanel({ onClose }: { onClose: () => void }) {
  const createUserMutation = useMutation(useCreateGlobalUserMutationOptions());
  const form = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      role: 'VIEWER',
    } as CreateGlobalUserPayload,
    validators: {
      onMount: createGlobalUserPayloadSchema,
      onChange: createGlobalUserPayloadSchema,
      onSubmit: createGlobalUserPayloadSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      if (!formApi.state.isValid) return;

      try {
        await createUserMutation.mutateAsync(value);
        toast.success(`User ${value.email} created`);
        onClose();
      } catch (error) {
        toast.error(getUserErrorMessage(error, 'creating'));
      }
    },
  });

  return (
    <>
      <PanelHeader title="Create user" description="Create an account without assigning it to an organization." />
      <form
        id="create-global-user-form"
        className="grid grid-cols-1 gap-md sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="first_name">
          {(field) => (
            <Field label="First name" htmlFor={field.name}>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                onBlur={field.handleBlur}
              />
            </Field>
          )}
        </form.Field>
        <form.Field name="last_name">
          {(field) => (
            <Field label="Last name" htmlFor={field.name}>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                onBlur={field.handleBlur}
              />
            </Field>
          )}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <Field label="Email" htmlFor={field.name} className="sm:col-span-full">
              <Input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                onBlur={field.handleBlur}
              />
            </Field>
          )}
        </form.Field>
        <form.Field name="role">
          {(field) => (
            <Field label="Role" className="sm:col-span-full">
              <SelectV2<CreateGlobalUserPayload['role']>
                value={field.state.value}
                onChange={field.handleChange}
                placeholder="Select a role"
                options={GLOBAL_USER_ROLES.map((role) => ({ label: role, value: role }))}
              />
            </Field>
          )}
        </form.Field>
      </form>
      <Panel.Footer>
        <Panel.FooterButton isCloseButton label="Cancel" disabled={createUserMutation.isPending} />
        <form.Subscribe selector={(formState) => formState.canSubmit}>
          {(canSubmit) => (
            <Panel.FooterButton
              type="submit"
              form="create-global-user-form"
              label="Create user"
              variant="primary"
              disabled={!canSubmit || createUserMutation.isPending}
              isLoading={createUserMutation.isPending}
            />
          )}
        </form.Subscribe>
      </Panel.Footer>
    </>
  );
}

function EditUserPanel({ user, onClose }: { user: UserDto; onClose: () => void }) {
  const updateUserMutation = useMutation(useUpdateGlobalUserMutationOptions());
  const form = useForm({
    defaultValues: {
      userId: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role as UpdateGlobalUserPayload['role'],
      organization_id: user.organization_id,
    } as UpdateGlobalUserPayload,
    validators: {
      onMount: updateGlobalUserPayloadSchema,
      onChange: updateGlobalUserPayloadSchema,
      onSubmit: updateGlobalUserPayloadSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      if (!formApi.state.isValid) return;

      try {
        await updateUserMutation.mutateAsync(value);
        toast.success(`User ${value.email} updated`);
        onClose();
      } catch (error) {
        toast.error(getUserErrorMessage(error, 'updating'));
      }
    },
  });

  return (
    <>
      <PanelHeader
        title="Edit user"
        description={
          user.organization_id
            ? `Organization: ${user.organization_id}`
            : 'This user is not assigned to an organization.'
        }
      />
      <form
        id="edit-global-user-form"
        className="grid grid-cols-1 gap-md sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="first_name">
          {(field) => (
            <Field label="First name" htmlFor={field.name}>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                onBlur={field.handleBlur}
              />
            </Field>
          )}
        </form.Field>
        <form.Field name="last_name">
          {(field) => (
            <Field label="Last name" htmlFor={field.name}>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                onBlur={field.handleBlur}
              />
            </Field>
          )}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <Field label="Email" htmlFor={field.name} className="sm:col-span-full">
              <Input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                onBlur={field.handleBlur}
              />
            </Field>
          )}
        </form.Field>
        <form.Field name="role">
          {(field) => (
            <Field label="Role" className="sm:col-span-full">
              <SelectV2<UpdateGlobalUserPayload['role']>
                value={field.state.value}
                onChange={field.handleChange}
                placeholder="Select a role"
                options={GLOBAL_USER_ROLES.map((role) => ({ label: role, value: role }))}
              />
            </Field>
          )}
        </form.Field>
      </form>
      <Panel.Footer>
        <Panel.FooterButton isCloseButton label="Cancel" disabled={updateUserMutation.isPending} />
        <form.Subscribe selector={(formState) => [formState.canSubmit, formState.isDirty] as const}>
          {([canSubmit, isDirty]) => (
            <Panel.FooterButton
              type="submit"
              form="edit-global-user-form"
              label="Save changes"
              variant="primary"
              disabled={!canSubmit || !isDirty || updateUserMutation.isPending}
              isLoading={updateUserMutation.isPending}
            />
          )}
        </form.Subscribe>
      </Panel.Footer>
    </>
  );
}

function PanelHeader({ title, description }: { title: string; description: string }) {
  return (
    <Panel.Header>
      <div className="flex flex-col gap-2xs">
        <span>{title}</span>
        <p className="text-grey-secondary text-small font-normal">{description}</p>
      </div>
    </Panel.Header>
  );
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={`flex flex-col gap-xs ${className ?? ''}`}>
      <span className="text-grey-primary text-s font-medium">{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-grey-border bg-surface-card flex flex-col items-center gap-xs rounded-lg border border-dashed p-2xl text-center">
      <Typo variant="subtitle1">{title}</Typo>
      <p className="text-grey-secondary text-s">{body}</p>
    </div>
  );
}

function UsersSkeleton() {
  return (
    <div className="flex flex-col gap-md">
      <div className="bg-grey-background-light h-10 w-100 max-w-full animate-pulse rounded-md" />
      <div className="border-grey-border bg-surface-card divide-grey-border flex flex-col divide-y overflow-hidden rounded-lg border">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-md p-md">
            <div className="flex flex-col gap-xs">
              <div className="bg-grey-background-light h-3.5 w-40 animate-pulse rounded" />
              <div className="bg-grey-background-light h-2.5 w-52 animate-pulse rounded" />
            </div>
            <div className="bg-grey-background-light h-6 w-20 animate-pulse rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function getUserErrorMessage(error: unknown, action: 'creating' | 'updating') {
  if (error instanceof Error && error.message === DUPLICATE_EMAIL_ERROR) {
    return 'A user with this email already exists';
  }

  return `Something went wrong while ${action} the user`;
}
