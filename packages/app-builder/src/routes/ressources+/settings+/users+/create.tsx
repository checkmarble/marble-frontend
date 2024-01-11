import { AutomaticSendSignInLink } from '@app-builder/components/Auth/SendSignInLink';
import { FormError } from '@app-builder/components/Form/FormError';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import {
  useFetcher,
  useNavigate,
  useNavigation,
  useSearchParams,
} from '@remix-run/react';
import { type Namespace, type ParseKeys } from 'i18next';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';
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

const signInLinkEmailSearchParam = 'signInLinkEmail';

export async function action({ request }: ActionFunctionArgs) {
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
    return redirect(
      `${getRoute('/settings/users')}?${signInLinkEmailSearchParam}=${
        submission.value.email
      }`,
    );
  } catch (error) {
    return json(submission);
  }
}

export function CreateUser({ orgId }: { orgId: string }) {
  const { t } = useTranslation(handle.i18n);
  const [open, setOpen] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signInLinkEmail = searchParams.get(signInLinkEmailSearchParam);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <AutomaticSendSignInLink
        email={signInLinkEmail}
        onSend={() => {
          navigate(getRoute('/settings/users'), { replace: true });
        }}
      />
      <Modal.Trigger asChild>
        <Button onClick={(e) => e.stopPropagation()}>
          <Icon icon="plus" className="size-6" />
          {t('settings:users.new_user')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <CreateUserContent orgId={orgId} />
      </Modal.Content>
    </Modal.Root>
  );
}

const CreateUserContent = ({ orgId }: { orgId: string }) => {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const defaultValue = {
    firstName: '',
    lastName: '',
    email: '',
    role: 'VIEWER',
    organizationId: orgId,
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

  return (
    <fetcher.Form
      action={getRoute('/ressources/settings/users/create')}
      method="POST"
      {...form.props}
    >
      <Modal.Title>{t('settings:users.new_user')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
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
            <FormSelect.Default config={role}>
              {roleOptions.map(({ value, labelTKey }) => (
                <Select.DefaultItem key={value} value={value}>
                  {t(labelTKey)}
                </Select.DefaultItem>
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
};

export const roleOptions: {
  value: string;
  labelTKey: ParseKeys<['settings']>;
}[] = [
  { value: 'VIEWER', labelTKey: 'settings:users.role.viewer' },
  { value: 'BUILDER', labelTKey: 'settings:users.role.builder' },
  { value: 'PUBLISHER', labelTKey: 'settings:users.role.publisher' },
  { value: 'ADMIN', labelTKey: 'settings:users.role.admin' },
];
