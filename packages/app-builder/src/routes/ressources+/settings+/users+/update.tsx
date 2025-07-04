import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { Nudge } from '@app-builder/components/Nudge';
import { tKeyForUserRole, type User } from '@app-builder/models';
import { getUserRoles, isAccessible } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

function getUpdateUserFormSchema(userRoles: readonly [string, ...string[]]) {
  return z.object({
    userId: z.string().uuid(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email().min(5),
    role: z.enum(userRoles),
    organizationId: z.string().uuid(),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, rawData, { apiClient, entitlements }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = getUpdateUserFormSchema(getUserRoles(entitlements)).safeParse(
    rawData,
  );

  if (!success) {
    return json(
      { status: 'error', errors: error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await apiClient.updateUser(data.userId, {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      role: data.role,
      organization_id: data.organizationId,
    });

    return redirect(getRoute('/settings/users'));
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

export function UpdateUser({
  user,
  userRoles,
  access,
}: {
  user: User;
  userRoles: readonly [string, ...string[]];
  access: FeatureAccessLevelDto;
}) {
  const { t } = useTranslation(handle.i18n);
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);

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
          aria-label={t('settings:users.update_user')}
        />
      </Modal.Trigger>
      <Modal.Content>
        <UpdateUserContent user={user} userRoles={userRoles} access={access} />
      </Modal.Content>
    </Modal.Root>
  );
}

function UpdateUserContent({
  user,
  userRoles,
  access,
}: {
  user: User;
  userRoles: readonly [string, ...string[]];
  access: FeatureAccessLevelDto;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();
  const schema = useMemo(() => getUpdateUserFormSchema(userRoles), [userRoles]);

  const form = useForm({
    defaultValues: user as z.infer<typeof schema>,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/settings/users/update'),
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
      <Modal.Title>{t('settings:users.update_user')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex gap-2">
            <form.Field
              name="firstName"
              validators={{ onBlur: schema.shape.firstName, onChange: schema.shape.firstName }}
            >
              {(field) => (
                <div className="group flex w-full flex-col gap-2">
                  <FormLabel name={field.name}>{t('settings:users.first_name')}</FormLabel>
                  <FormInput
                    type="text"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    defaultValue={field.state.value}
                    valid={field.state.meta.errors.length === 0}
                  />
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
            <form.Field
              name="lastName"
              validators={{ onBlur: schema.shape.lastName, onChange: schema.shape.lastName }}
            >
              {(field) => (
                <div className="group flex w-full flex-col gap-2">
                  <FormLabel name={field.name}>{t('settings:users.last_name')}</FormLabel>
                  <FormInput
                    type="text"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    defaultValue={field.state.value}
                    valid={field.state.meta.errors.length === 0}
                  />
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
          </div>
          <form.Field
            name="email"
            validators={{ onBlur: schema.shape.email, onChange: schema.shape.email }}
          >
            {(field) => (
              <div className="group flex flex-col gap-2">
                <FormLabel name={field.name}>{t('settings:users.email')}</FormLabel>
                <FormInput
                  type="email"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  defaultValue={field.state.value}
                  valid={field.state.meta.errors.length === 0}
                />
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
                <FormLabel name={field.name} className="flex flex-row gap-2">
                  <span
                    className={clsx({
                      'text-grey-80': access === 'restricted',
                    })}
                  >
                    {t('settings:users.role')}
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
                  defaultValue={field.state.value}
                  onValueChange={field.handleChange}
                  disabled={!isAccessible(access)}
                  name={field.name}
                >
                  {userRoles.map((role) => (
                    <Select.DefaultItem key={role} value={role}>
                      {t(tKeyForUserRole(role))}
                    </Select.DefaultItem>
                  ))}
                </Select.Default>
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
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
