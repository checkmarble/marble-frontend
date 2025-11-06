import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { Nudge } from '@app-builder/components/Nudge';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type User } from '@app-builder/models';
import { tKeyForInboxUserRole } from '@app-builder/models/inbox';
import {
  CreateInboxUserPayload,
  createInboxUserPayloadSchema,
  useCreateInboxUserMutation,
} from '@app-builder/queries/settings/inboxes/create-inbox-user';
import { getInboxUserRoles, isAccessible } from '@app-builder/services/feature-access';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import clsx from 'clsx';
import { Namespace } from 'i18next';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, Modal, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateInboxUser({
  inboxId,
  users,
  inboxUserRoles,
  access,
  isAutoAssignmentAvailable = false,
}: {
  inboxId: string;
  users: User[];
  inboxUserRoles: ReturnType<typeof getInboxUserRoles>;
  access: FeatureAccessLevelDto;
  isAutoAssignmentAvailable: boolean;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);

  const handleOnSuccess = () => {
    setOpen(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild onClick={(e) => e.stopPropagation()}>
        <Button>
          <Icon icon="plus" className="size-6" />
          {t('settings:inboxes.inbox_details.add_member')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()} aria-describedby={undefined}>
        <CreateInboxUserContent
          currentInboxId={inboxId}
          users={users}
          inboxUserRoles={inboxUserRoles}
          access={access}
          isAutoAssignmentAvailable={isAutoAssignmentAvailable}
          onSuccess={handleOnSuccess}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

export function CreateInboxUserContent({
  currentInboxId,
  users,
  inboxUserRoles,
  access,
  isAutoAssignmentAvailable = false,
  onSuccess,
}: {
  currentInboxId: string;
  users: User[];
  inboxUserRoles: ReturnType<typeof getInboxUserRoles>;
  access: FeatureAccessLevelDto;
  isAutoAssignmentAvailable: boolean;
  onSuccess: () => void;
}) {
  const { t } = useTranslation(['common', 'settings'] satisfies Namespace);
  const createInboxUserMutation = useCreateInboxUserMutation();
  const revalidate = useLoaderRevalidator();
  const [searchValue, setSearchValue] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const deferredSearchValue = useDeferredValue(searchValue);
  const filteredUsers = useMemo(
    () =>
      matchSorter(users, deferredSearchValue, {
        keys: [(u: User) => `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(), 'firstName', 'lastName'],
      }),
    [deferredSearchValue, users],
  );

  const form = useForm({
    defaultValues: {
      userId: '',
      inboxId: currentInboxId,
      role: 'admin',
      autoAssignable: false,
    } as CreateInboxUserPayload,
    onSubmit: async ({ value }) => {
      createInboxUserMutation.mutateAsync(value).then((res) => {
        if (!res) {
          onSuccess();
        }
        revalidate();
      });
    },
    validators: {
      onSubmit: createInboxUserPayloadSchema,
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Modal.Title>{t('settings:inboxes.inbox_details.add_member')}</Modal.Title>
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <form.Field
          name="userId"
          validators={{
            onChange: createInboxUserPayloadSchema.shape.userId,
          }}
        >
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name}>{t('settings:inboxes.inbox_details.user')}</FormLabel>
              <MenuCommand.Menu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <MenuCommand.Trigger>
                  <MenuCommand.SelectButton hasError={field.state.meta.errors.length > 0} className="w-full">
                    {users.find((u) => u.userId === field.state.value)
                      ? `${users.find((u) => u.userId === field.state.value)?.firstName ?? ''} ${users.find((u) => u.userId === field.state.value)?.lastName ?? ''}`
                      : ''}
                  </MenuCommand.SelectButton>
                </MenuCommand.Trigger>
                <MenuCommand.Content sameWidth align="start" className="min-w-(--radix-popover-trigger-width)">
                  <MenuCommand.Combobox placeholder={t('common:search')} onValueChange={setSearchValue} />
                  <MenuCommand.List className="max-h-60">
                    {filteredUsers.map(({ userId, firstName, lastName }) => (
                      <MenuCommand.Item
                        key={userId}
                        value={`${firstName ?? ''} ${lastName ?? ''}`.trim()}
                        selected={field.state.value === userId}
                        onSelect={() => {
                          field.handleChange(userId);
                          setUserMenuOpen(false);
                          setSearchValue('');
                        }}
                      >
                        {`${firstName} ${lastName}`}
                      </MenuCommand.Item>
                    ))}
                    <MenuCommand.Empty>
                      <div className="text-center p-2">{t('common:no_results', { defaultValue: '' })}</div>
                    </MenuCommand.Empty>
                  </MenuCommand.List>
                </MenuCommand.Content>
              </MenuCommand.Menu>
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field
          name="role"
          validators={{
            onChange: createInboxUserPayloadSchema.shape.role,
          }}
        >
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name} className="flex gap-2">
                <span className={clsx({ 'text-grey-80': access === 'restricted' })}>
                  {t('settings:inboxes.inbox_details.role')}
                </span>
                {access === 'allowed' ? null : (
                  <Nudge content={t('settings:users.role.nudge')} className="size-6" kind={access} />
                )}
              </FormLabel>
              <MenuCommand.Menu open={roleMenuOpen} onOpenChange={setRoleMenuOpen}>
                <MenuCommand.Trigger>
                  <MenuCommand.SelectButton
                    hasError={field.state.meta.errors.length > 0}
                    className="w-full"
                    disabled={!isAccessible(access)}
                  >
                    {field.state.value ? t(tKeyForInboxUserRole(field.state.value)) : ''}
                  </MenuCommand.SelectButton>
                </MenuCommand.Trigger>
                <MenuCommand.Content sameWidth align="start" className="min-w-(--radix-popover-trigger-width)">
                  <MenuCommand.List>
                    {inboxUserRoles.map((role) => (
                      <MenuCommand.Item
                        key={role}
                        value={role}
                        selected={field.state.value === role}
                        onSelect={() => {
                          field.handleChange(role);
                          setRoleMenuOpen(false);
                        }}
                      >
                        {t(tKeyForInboxUserRole(role))}
                      </MenuCommand.Item>
                    ))}
                  </MenuCommand.List>
                </MenuCommand.Content>
              </MenuCommand.Menu>
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field
          name="autoAssignable"
          validators={{
            onChange: createInboxUserPayloadSchema.shape.autoAssignable,
          }}
        >
          {(field) => (
            <div className="group flex justify-between">
              <div className="flex gap-2">
                <FormLabel name={field.name} className="flex items-center gap-2">
                  {t('settings:inboxes.inbox_details.auto_assign_enabled.label')}
                </FormLabel>
                {!isAutoAssignmentAvailable ? (
                  <Nudge
                    className="size-5"
                    kind="restricted"
                    content={t('settings:inboxes.auto_assign_queue_limit.nudge', {
                      defaultValue: 'N/A',
                    })}
                  />
                ) : null}
              </div>

              <Switch
                checked={isAutoAssignmentAvailable ? field.state.value : false}
                onCheckedChange={field.handleChange}
                disabled={!isAutoAssignmentAvailable}
              />
            </div>
          )}
        </form.Field>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button type="button" className="flex-1" variant="secondary">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button className="flex-1" variant="primary" type="submit" name="create">
            <Icon icon="new-inbox" className="size-6" />
            {t('settings:inboxes.inbox_details.create_user')}
          </Button>
        </div>
      </div>
    </form>
  );
}
