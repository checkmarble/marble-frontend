import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { Nudge } from '@app-builder/components/Nudge';
import { type User } from '@app-builder/models';
import { tKeyForInboxUserRole } from '@app-builder/models/inbox';
import { getInboxUserRoles, isAccessible } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { matchSorter } from 'match-sorter';
import { omit } from 'radash';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, Modal, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

function getCreateInboxUserFormSchema(inboxUserRoles: readonly [string, ...string[]]) {
  return z.object({
    userId: z.uuid().nonempty(),
    inboxId: z.uuid().nonempty(),
    role: z.enum(inboxUserRoles),
    autoAssignable: z.boolean(),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, rawData, { inbox, entitlements }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = getCreateInboxUserFormSchema(
    getInboxUserRoles(entitlements),
  ).safeParse(rawData);

  if (!success) {
    return Response.json(
      { status: 'error', errors: z.treeifyError(error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await inbox.createInboxUser(data.inboxId, omit(data, ['inboxId']));

    return redirect(
      getRoute('/settings/inboxes/:inboxId', {
        inboxId: fromUUIDtoSUUID(data.inboxId),
      }),
    );
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return Response.json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export function CreateInboxUser({
  inboxId,
  users,
  inboxUserRoles,
  access,
  isAutoAssignmentAvailable = false,
}: {
  inboxId: string;
  users: User[];
  inboxUserRoles: readonly [string, ...string[]];
  access: FeatureAccessLevelDto;
  isAutoAssignmentAvailable: boolean;
}) {
  const { t } = useTranslation(handle.i18n);
  const [open, setOpen] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

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
}: {
  currentInboxId: string;
  users: User[];
  inboxUserRoles: readonly [string, ...string[]];
  access: FeatureAccessLevelDto;
  isAutoAssignmentAvailable: boolean;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();
  const schema = useMemo(() => getCreateInboxUserFormSchema(inboxUserRoles), [inboxUserRoles]);
  const [searchValue, setSearchValue] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const deferredSearchValue = useDeferredValue(searchValue);
  const filteredUsers = useMemo(
    () =>
      matchSorter(users, deferredSearchValue, {
        keys: [
          (u: User) => `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
          'firstName',
          'lastName',
        ],
      }),
    [deferredSearchValue, users],
  );

  const form = useForm({
    defaultValues: {
      userId: '',
      inboxId: currentInboxId,
      role: 'admin',
      autoAssignable: false,
    } as z.infer<typeof schema>,
    onSubmit: async ({ value }) => {
      await fetcher.submit(value, {
        method: 'POST',
        action: getRoute('/ressources/settings/inboxes/inbox-users/create'),
        encType: 'application/json',
      });
    },
    validators: {
      onSubmit: schema,
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
          validators={{ onBlur: schema.shape.userId, onChange: schema.shape.userId }}
        >
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name}>{t('settings:inboxes.inbox_details.user')}</FormLabel>
              <MenuCommand.Menu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <MenuCommand.Trigger>
                  <MenuCommand.SelectButton
                    hasError={field.state.meta.errors.length > 0}
                    className="w-full"
                  >
                    {users.find((u) => u.userId === field.state.value)
                      ? `${users.find((u) => u.userId === field.state.value)?.firstName ?? ''} ${users.find((u) => u.userId === field.state.value)?.lastName ?? ''}`
                      : ''}
                  </MenuCommand.SelectButton>
                </MenuCommand.Trigger>
                <MenuCommand.Content
                  sameWidth
                  align="start"
                  className="min-w-[var(--radix-popover-trigger-width)]"
                >
                  <MenuCommand.Combobox
                    placeholder={t('common:search')}
                    onValueChange={setSearchValue}
                  />
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
                      <div className="text-center p-2">
                        {t('common:no_results', { defaultValue: 'No results' })}
                      </div>
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
          validators={{ onBlur: schema.shape.role, onChange: schema.shape.role }}
        >
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name} className="flex gap-2">
                <span className={clsx({ 'text-grey-80': access === 'restricted' })}>
                  {t('settings:inboxes.inbox_details.role')}
                </span>
                {access === 'allowed' ? null : (
                  <Nudge
                    content={t('settings:users.role.nudge')}
                    className="size-6"
                    kind={access}
                  />
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
                <MenuCommand.Content
                  sameWidth
                  align="start"
                  className="min-w-[var(--radix-popover-trigger-width)]"
                >
                  <MenuCommand.List>
                    {inboxUserRoles.map((role) => (
                      <MenuCommand.Item
                        key={role}
                        value={role}
                        selected={field.state.value === role}
                        onSelect={(value) => {
                          field.handleChange(value);
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
            onBlur: schema.shape.autoAssignable,
            onChange: schema.shape.autoAssignable,
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
