import { FormError } from '@app-builder/components/Form/FormError';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { conform, useForm, useInputEvent } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import {
  type ActionArgs,
  json,
  type LoaderArgs,
  redirect,
} from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { type Namespace, type ParseKeys } from 'i18next';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Select } from 'ui-design-system';
import { Plus } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'navigation', 'common'] satisfies Namespace,
};

const createUserFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().min(5),
  role: z.enum(['VIEWER', 'BUILDER', 'PUBLISHER', 'ADMIN'] as const),
  organizationId: z.string().uuid(),
});

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { organization } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const org = await organization.getCurrentOrganization();

  return json({ org });
}

export async function action({ request }: ActionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const formData = await request.formData();
  const submission = parse(formData, { schema: createUserFormSchema });

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
    return json(submission);
  }
}

export function CreateUser() {
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
        <Button>
          <Plus width={'24px'} height={'24px'} />
          {t('settings:users.new_user')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <CreateUserContent />
      </Modal.Content>
    </Modal.Root>
  );
}

const CreateUserContent = () => {
  const { t } = useTranslation(handle.i18n);
  const dataFetcher = useFetcher<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const { load } = dataFetcher;
  useEffect(() => {
    load('/ressources/settings/users/create');
  }, [load]);

  const org = dataFetcher.data?.org;
  const defaultValue = {
    firstName: '',
    lastName: '',
    email: '',
    role: 'VIEWER',
    organizationId: org?.id ?? '',
  };

  const formId = useId();

  const [form, { firstName, lastName, email, role, organizationId }] = useForm({
    id: formId,
    defaultValue,
    lastSubmission: fetcher.data,
    constraint: getFieldsetConstraint(createUserFormSchema),
    onValidate({ formData }) {
      return parse(formData, {
        schema: createUserFormSchema,
      });
    },
  });

  const shadowInputRef = useRef<HTMLInputElement>(null);
  const control = useInputEvent({
    ref: shadowInputRef,
  });

  return (
    <fetcher.Form
      action="/ressources/settings/users/create"
      method="POST"
      {...form.props}
    >
      <Modal.Title>{t('settings:users.new_user')}</Modal.Title>
      <div className="bg-grey-00 flex flex-col gap-8 p-8">
        <div className="text-s flex flex-1 flex-col gap-4 font-bold">
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
            <input
              ref={shadowInputRef}
              {...conform.input(role, {
                hidden: true,
              })}
            />
            <Select.Default
              defaultValue={role.defaultValue ?? ''}
              onValueChange={control.change}
            >
              {roleOptions.map(({ value, labelTKey }) => (
                <Select.DefaultItem key={value} value={value}>
                  {t(labelTKey)}
                </Select.DefaultItem>
              ))}
            </Select.Default>
            <FormError />
          </FormField>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild></Modal.Close>
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
};

const roleOptions: { value: string; labelTKey: ParseKeys<['settings']> }[] = [
  { value: 'VIEWER', labelTKey: 'settings:users.role.viewer' },
  { value: 'BUILDER', labelTKey: 'settings:users.role.builder' },
  { value: 'PUBLISHER', labelTKey: 'settings:users.role.publisher' },
  { value: 'ADMIN', labelTKey: 'settings:users.role.admin' },
];
