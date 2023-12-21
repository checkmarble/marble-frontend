import { FormError } from '@app-builder/components/Form/FormError';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { type User } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { type ActionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Edit } from 'ui-icons';
import { z } from 'zod';

import { roleOptions } from './create';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

const updateUserFormSchema = z.object({
  userId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().min(5),
  role: z.enum(['VIEWER', 'BUILDER', 'PUBLISHER', 'ADMIN'] as const),
  organizationId: z.string().uuid(),
});

export async function action({ request }: ActionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const formData = await request.formData();
  const submission = parse(formData, { schema: updateUserFormSchema });

  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission);
  }

  try {
    await apiClient.updateUser(submission.value.userId, {
      first_name: submission.value.firstName,
      last_name: submission.value.lastName,
      email: submission.value.email,
      role: submission.value.role,
      organization_id: submission.value.organizationId,
    });
    return redirect(getRoute('/settings/users'));
  } catch (error) {
    return json(submission);
  }
}

export function UpdateUser({ user }: { user: User }) {
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
      <Modal.Trigger asChild>
        <Edit
          width="24px"
          height="24px"
          aria-label={t('settings:users.update_user')}
        />
      </Modal.Trigger>
      <Modal.Content>
        <UpdateUserContent user={user} />
      </Modal.Content>
    </Modal.Root>
  );
}

const UpdateUserContent = ({ user }: { user: User }) => {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();
  const formId = useId();

  const [form, { userId, firstName, lastName, email, role, organizationId }] =
    useForm({
      id: formId,
      defaultValue: user,
      lastSubmission: fetcher.data,
      constraint: getFieldsetConstraint(updateUserFormSchema),
      onValidate({ formData }) {
        return parse(formData, {
          schema: updateUserFormSchema,
        });
      },
    });

  return (
    <fetcher.Form
      action={getRoute('/ressources/settings/users/update')}
      method="PATCH"
      {...form.props}
    >
      <Modal.Title>{t('settings:users.update_user')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex flex-1 flex-col gap-4 font-bold">
          <input {...conform.input(userId, { type: 'hidden' })} />
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
              {roleOptions.map(({ value, labelTKey }) => (
                <FormSelect.DefaultItem key={value} value={value}>
                  {t(labelTKey)}
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
            name="update"
          >
            {t('common:save')}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
};
