import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { Nudge } from '@app-builder/components/Nudge';
import { isStatusConflictHttpError, tKeyForUserRole } from '@app-builder/models';
import { getUserRoles, isAccessible } from '@app-builder/services/feature-access';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { type FeatureAccessDto } from 'marble-api/generated/license-api';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'navigation', 'common'] satisfies Namespace,
};

function getCreateUserFormSchema(userRoles: readonly [string, ...string[]]) {
  return z.object({
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
    email: z.string().email().nonempty(),
    role: z.enum(userRoles),
    organizationId: z.string().uuid().nonempty(),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;

  const [t, session, rawData, { apiClient, entitlements }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = getCreateUserFormSchema(getUserRoles(entitlements)).safeParse(
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
    await apiClient.createUser({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      role: data.role,
      organization_id: data.organizationId,
    });

    return redirect(getRoute('/settings/users'));
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      message: isStatusConflictHttpError(error)
        ? t('common:errors.list.duplicate_email')
        : t('common:errors.unknown'),
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export function CreateUser({
  orgId,
  userRoles,
  access,
}: {
  orgId: string;
  access: FeatureAccessDto;
  userRoles: readonly [string, ...string[]];
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
      <Modal.Trigger asChild>
        <Button onClick={(e) => e.stopPropagation()}>
          <Icon icon="plus" className="size-6" />
          {t('settings:users.new_user')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <CreateUserContent orgId={orgId} access={access} userRoles={userRoles} />
      </Modal.Content>
    </Modal.Root>
  );
}

function CreateUserContent({
  orgId,
  userRoles,
  access,
}: {
  orgId: string;
  userRoles: readonly [string, ...string[]];
  access: FeatureAccessDto;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();
  const schema = useMemo(() => getCreateUserFormSchema(userRoles), [userRoles]);

  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'ADMIN',
      organizationId: orgId,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/settings/users/create'),
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
      <Modal.Title>{t('settings:users.new_user')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex gap-2">
            <form.Field name="firstName">
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
                  <FormErrorOrDescription errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
            <form.Field name="lastName">
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
                  <FormErrorOrDescription errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="email">
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
                <FormErrorOrDescription errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
          <form.Field name="role">
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
                <FormErrorOrDescription />
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
          <Button className="flex-1" variant="primary" type="submit" name="create">
            {t('settings:users.new_user.create')}
          </Button>
        </div>
      </div>
    </form>
  );
}
