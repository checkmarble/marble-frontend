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
import { FormProvider, getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { Button, ModalV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const createApiKeyFormSchema = z.object({
  description: z.string().min(1),
  role: z.enum(apiKeyRoleOptions),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    csrfService,
    toastSessionService,
    authSessionService,
    i18nextService: { getFixedT },
  } = serverServices;
  const { apiKey } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  await csrfService.validate(request);

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: createApiKeyFormSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
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
    const t = await getFixedT(request, ['common']);

    const formError = t('common:errors.unknown');

    setToastMessage(toastSession, {
      type: 'error',
      message: formError,
    });

    return json(submission.reply({ formErrors: [formError] }), {
      headers: {
        'Set-Cookie': await toastSessionService.commitSession(toastSession),
      },
    });
  }
}

export function CreateApiKey() {
  const { t } = useTranslation(['settings']);
  const [open, setOpen] = React.useState(false);

  const navigation = useNavigation();
  React.useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger onClick={(e) => e.stopPropagation()} render={<Button />}>
        <Icon icon="plus" className="size-6" />
        {t('settings:api_keys.new_api_key')}
      </ModalV2.Trigger>
      <ModalV2.Content onClick={(e) => e.stopPropagation()}>
        <CreateApiKeyContent />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

const CreateApiKeyContent = () => {
  const { t } = useTranslation(['settings', 'common']);
  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    defaultValue: { description: '', role: 'API_CLIENT' },
    lastResult: fetcher.data,
    constraint: getZodConstraint(createApiKeyFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: createApiKeyFormSchema,
      });
    },
  });

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        action={getRoute('/ressources/settings/api-keys/create')}
        method="POST"
        {...getFormProps(form)}
      >
        <ModalV2.Title>{t('settings:api_keys.new_api_key')}</ModalV2.Title>
        <div className="bg-grey-00 flex flex-col gap-6 p-6">
          <AuthenticityTokenInput />
          <FormField
            name={fields.description.name}
            className="group flex flex-col gap-2"
          >
            <FormLabel>{t('settings:api_keys.description')}</FormLabel>
            <FormInput type="text" />
            <FormError />
          </FormField>
          <FormField
            name={fields.role.name}
            className="group flex flex-col gap-2"
          >
            <FormLabel>{t('settings:api_keys.role')}</FormLabel>
            <FormSelect.Default
              disabled={apiKeyRoleOptions.length === 1}
              options={apiKeyRoleOptions}
            >
              {apiKeyRoleOptions.map((role) => (
                <FormSelect.DefaultItem key={role} value={role}>
                  {t(tKeyForApiKeyRole(role))}
                </FormSelect.DefaultItem>
              ))}
            </FormSelect.Default>
            <FormError />
          </FormField>
          <div className="flex flex-1 flex-row gap-2">
            <ModalV2.Close
              render={<Button className="flex-1" variant="secondary" />}
            >
              {t('common:cancel')}
            </ModalV2.Close>
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
    </FormProvider>
  );
};
