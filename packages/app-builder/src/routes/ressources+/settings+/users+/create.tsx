import { FormError } from '@app-builder/components/Form/FormError';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  isStatusConflictHttpError,
  tKeyForUserRole,
} from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'navigation', 'common'] satisfies Namespace,
};

function getCreateUserFormSchema(userRoles: readonly [string, ...string[]]) {
  return z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email().min(5),
    role: z.enum(userRoles),
    organizationId: z.string().uuid(),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { authService, csrfService, featureAccessService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  await csrfService.validate(request);

  const formData = await request.formData();
  const submission = parse(formData, {
    schema: getCreateUserFormSchema(await featureAccessService.getUserRoles()),
  });

  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission);
  }

  try {
    await apiClient.createUser({
      first_name: submission.value.firstName,
      last_name: submission.value.lastName,
      email: submission.value.email,
      role: submission.value.role,
      organization_id: submission.value.organizationId,
    });

    return redirect(getRoute('/settings/users'));
  } catch (error) {
    const { getSession, commitSession } = serverServices.toastSessionService;
    const session = await getSession(request);
    if (isStatusConflictHttpError(error)) {
      setToastMessage(session, {
        type: 'error',
        messageKey: 'common:errors.list.duplicate_email',
      });
    } else {
      setToastMessage(session, {
        type: 'error',
        messageKey: 'common:errors.unknown',
      });
    }
    return json(submission, {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }
}

export function CreateUser({
  orgId,
  userRoles,
}: {
  orgId: string;
  userRoles: readonly [string, ...string[]];
}) {
  const { t } = useTranslation(handle.i18n);
  const [open, setOpen] = React.useState(false);

  const navigation = useNavigation();
  React.useEffect(() => {
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
        <CreateUserContent orgId={orgId} userRoles={userRoles} />
      </Modal.Content>
    </Modal.Root>
  );
}

function CreateUserContent({
  orgId,
  userRoles,
}: {
  orgId: string;
  userRoles: readonly [string, ...string[]];
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();
  const schema = React.useMemo(
    () => getCreateUserFormSchema(userRoles),
    [userRoles],
  );

  const defaultValue = {
    firstName: '',
    lastName: '',
    email: '',
    role: 'VIEWER',
    organizationId: orgId,
  };

  const formId = React.useId();

  const [form, { firstName, lastName, email, role, organizationId }] = useForm({
    id: formId,
    defaultValue,
    lastSubmission: fetcher.data,
    constraint: getFieldsetConstraint(schema),
    onValidate({ formData }) {
      return parse(formData, {
        schema,
      });
    },
  });

  return (
    <fetcher.Form
      action={getRoute('/ressources/settings/users/create')}
      method="POST"
      {...form.props}
    >
      <Modal.Title>{t('settings:users.new_user')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-1 flex-col gap-4">
          <AuthenticityTokenInput />
          <input {...conform.input(organizationId, { type: 'hidden' })} />
          <div className="flex gap-2">
            <FormField
              config={firstName}
              className="group flex w-full flex-col gap-2"
            >
              <FormLabel>{t('settings:users.first_name')}</FormLabel>
              <FormInput type="text" />
              <FormError />
            </FormField>
            <FormField
              config={lastName}
              className="group flex w-full flex-col gap-2"
            >
              <FormLabel>{t('settings:users.last_name')}</FormLabel>
              <FormInput type="text" />
              <FormError />
            </FormField>
          </div>
          <FormField config={email} className="group flex flex-col gap-2">
            <FormLabel>{t('settings:users.email')}</FormLabel>
            <FormInput type="text" />
            <FormError />
          </FormField>
          <FormField config={role} className="group flex flex-col gap-2">
            <FormLabel>{t('settings:users.role')}</FormLabel>
            <FormSelect.Default config={role}>
              {userRoles.map((role) => (
                <FormSelect.DefaultItem key={role} value={role}>
                  {t(tKeyForUserRole(role))}
                </FormSelect.DefaultItem>
              ))}
            </FormSelect.Default>
            <FormError />
          </FormField>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            className="flex-1"
            variant="primary"
            type="submit"
            name="create"
          >
            {t('settings:users.new_user.create')}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
}
