import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { Nudge } from '@app-builder/components/Nudge';
import { type InboxUser, tKeyForInboxUserRole } from '@app-builder/models/inbox';
import { getInboxUserRoles, isAccessible } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { pick } from 'radash';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

function getUpdateInboxUserFormSchema(inboxUserRoles: readonly [string, ...string[]]) {
  return z.object({
    id: z.string().uuid(),
    inboxId: z.string().uuid(),
    role: z.enum(inboxUserRoles),
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

  const { data, success, error } = getUpdateInboxUserFormSchema(
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
    await inbox.updateInboxUser(data.id, pick(data, ['role']));

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

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export function UpdateInboxUser({
  inboxUser,
  inboxUserRoles,
  access,
}: {
  inboxUser: InboxUser;
  inboxUserRoles: readonly [string, ...string[]];
  access: FeatureAccessLevelDto;
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
      <Modal.Trigger>
        <Icon
          icon="edit-square"
          className="size-6 shrink-0"
          aria-label={t('settings:tags.update_tag')}
        />
      </Modal.Trigger>
      <Modal.Content>
        <UpdateInboxUserContent
          currentInboxUser={inboxUser}
          inboxUserRoles={inboxUserRoles}
          access={access}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

export function UpdateInboxUserContent({
  currentInboxUser,
  inboxUserRoles,
  access,
}: {
  currentInboxUser: InboxUser;
  inboxUserRoles: readonly [string, ...string[]];
  access: FeatureAccessLevelDto;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();
  const schema = React.useMemo(
    () => getUpdateInboxUserFormSchema(inboxUserRoles),
    [inboxUserRoles],
  );

  const form = useForm({
    defaultValues: currentInboxUser as z.infer<typeof schema>,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'PATCH',
          action: getRoute('/ressources/settings/inboxes/inbox-users/update'),
          encType: 'application/json',
        });
      }
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
      <Modal.Title>{t('settings:inboxes.inbox_user.update')}</Modal.Title>
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <form.Field
          name="role"
          validators={{ onBlur: schema.shape.role, onChange: schema.shape.role }}
        >
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name} className="flex gap-2">
                <span
                  className={clsx({
                    'text-grey-80': access === 'restricted',
                  })}
                >
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
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button className="flex-1" variant="primary" type="submit" name="update">
            {t('common:save')}
          </Button>
        </div>
      </div>
    </form>
  );
}
