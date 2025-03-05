import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { Nudge } from '@app-builder/components/Nudge';
import { type User } from '@app-builder/models';
import { tKeyForInboxUserRole } from '@app-builder/models/inbox';
import { getInboxUserRoles, isAccessible } from '@app-builder/services/feature-access';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { type FeatureAccessDto } from 'marble-api/generated/license-api';
import { omit } from 'radash';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

function getCreateInboxUserFormSchema(inboxUserRoles: readonly [string, ...string[]]) {
  return z.object({
    userId: z.string().uuid().nonempty(),
    inboxId: z.string().uuid().nonempty(),
    role: z.enum(inboxUserRoles),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;

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
    return json(
      { status: 'error', errors: error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await inbox.createInboxUser(data.inboxId, omit(data, ['inboxId']));

    return redirect(
      getRoute('/settings/inboxes/:inboxId', {
        inboxId: fromUUID(data.inboxId),
      }),
    );
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return json(
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
}: {
  inboxId: string;
  users: User[];
  inboxUserRoles: readonly [string, ...string[]];
  access: FeatureAccessDto;
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
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <CreateInboxUserContent
          currentInboxId={inboxId}
          users={users}
          inboxUserRoles={inboxUserRoles}
          access={access}
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
}: {
  currentInboxId: string;
  users: User[];
  inboxUserRoles: readonly [string, ...string[]];
  access: FeatureAccessDto;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();
  const schema = useMemo(() => getCreateInboxUserFormSchema(inboxUserRoles), [inboxUserRoles]);

  const form = useForm<z.infer<typeof schema>>({
    defaultValues: { userId: '', inboxId: currentInboxId, role: 'admin' },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/settings/inboxes/inbox-users/create'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChangeAsync: schema,
      onBlurAsync: schema,
      onSubmitAsync: schema,
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
        <form.Field name="userId">
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name}>{t('settings:inboxes.inbox_details.user')}</FormLabel>
              <Select.Default
                name={field.name}
                defaultValue={field.state.value}
                onValueChange={field.handleChange}
                borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
              >
                {users.map(({ userId, firstName, lastName }) => (
                  <Select.DefaultItem key={userId} value={userId}>
                    {`${firstName} ${lastName}`}
                  </Select.DefaultItem>
                ))}
              </Select.Default>
              <FormErrorOrDescription errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>
        <form.Field name="role">
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
              <Select.Default
                name={field.name}
                defaultValue={field.state.value}
                onValueChange={field.handleChange}
                borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
                disabled={!isAccessible(access)}
              >
                {inboxUserRoles.map((role) => (
                  <Select.DefaultItem key={role} value={role}>
                    {t(tKeyForInboxUserRole(role))}
                  </Select.DefaultItem>
                ))}
              </Select.Default>
              <FormErrorOrDescription />
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
