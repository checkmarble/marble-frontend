import { FormError } from '@app-builder/components/Form/FormError';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { apiKeyRoleOptions } from '@app-builder/models/api-keys';
import { tKeyForApiKeyRole } from '@app-builder/services/i18n/translation-keys/api-key';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const createApiKeyFormSchema = z.object({
  description: z.string().min(1),
  role: z.enum(apiKeyRoleOptions),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService, csrfService, toastSessionService, authSessionService } =
    serverServices;
  const { apiKey } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  await csrfService.validate(request);

  const formData = await request.formData();
  const submission = parse(formData, { schema: createApiKeyFormSchema });

  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission);
  }

  try {
    const createdApiKey = await apiKey.createApiKey(submission.value);

    const authSession = await authSessionService.getSession(request);
    authSession.flash('createdApiKey', createdApiKey);

    return redirect(getRoute('/settings/api-keys'), {
      headers: {
        'Set-Cookie': await authSessionService.commitSession(authSession),
      },
    });
  } catch (error) {
    const toastSession = await toastSessionService.getSession(request);
    setToastMessage(toastSession, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });
    return json(submission, {
      headers: {
        'Set-Cookie': await toastSessionService.commitSession(toastSession),
      },
    });
  }
}

export function CreateApiKey() {
  const { t } = useTranslation(['settings']);
  const [open, setOpen] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger onClick={(e) => e.stopPropagation()} asChild>
        <Button onClick={(e) => e.stopPropagation()}>
          <Icon icon="plus" className="size-6" />
          {t('settings:api_keys.new_api_key')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <CreateApiKeyContent />
      </Modal.Content>
    </Modal.Root>
  );
}

const CreateApiKeyContent = () => {
  const { t } = useTranslation(['settings', 'common']);
  const fetcher = useFetcher<typeof action>();

  const formId = useId();
  const [form, { description, role }] = useForm({
    id: formId,
    defaultValue: { description: '', role: 'API_CLIENT' },
    lastSubmission: fetcher.data,
    constraint: getFieldsetConstraint(createApiKeyFormSchema),
    onValidate({ formData }) {
      return parse(formData, {
        schema: createApiKeyFormSchema,
      });
    },
  });

  return (
    <fetcher.Form
      action={getRoute('/ressources/settings/api-keys/create')}
      method="POST"
      {...form.props}
    >
      <Modal.Title>{t('settings:api_keys.new_api_key')}</Modal.Title>
      <div className="bg-grey-00 flex flex-col gap-6 p-6">
        <AuthenticityTokenInput />
        <FormField config={description} className="group flex flex-col gap-2">
          <FormLabel>{t('settings:api_keys.description')}</FormLabel>
          <FormInput type="text" />
          <FormError />
        </FormField>
        <FormField config={role} className="group flex flex-col gap-2">
          <FormLabel>{t('settings:api_keys.role')}</FormLabel>
          <FormSelect.Default config={role}>
            {apiKeyRoleOptions.map((role) => (
              <FormSelect.DefaultItem key={role} value={role}>
                {t(tKeyForApiKeyRole(role))}
              </FormSelect.DefaultItem>
            ))}
          </FormSelect.Default>
          <FormError />
        </FormField>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            className="flex-1"
            variant="primary"
            type="submit"
            name="create"
          >
            {t('settings:api_keys.create')}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
};
