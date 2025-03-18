import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { apiKeyRoleOptions } from '@app-builder/models/api-keys';
import { tKeyForApiKeyRole } from '@app-builder/services/i18n/translation-keys/api-key';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const createApiKeyFormSchema = z.object({
  description: z.string().min(1),
  role: z.enum(apiKeyRoleOptions),
});

type CreateApiKeyForm = z.infer<typeof createApiKeyFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
    authSessionService: { getSession: getAuthSession, commitSession: commitAuthSession },
    i18nextService: { getFixedT },
  } = initServerServices(request);

  const [data, { apiKey }, session, authSession, t] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
    getSession(request),
    getAuthSession(request),
    getFixedT(request, ['common']),
  ]);

  const result = createApiKeyFormSchema.safeParse(data);

  if (!result.success) {
    return json(
      { status: 'error', errors: result.error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    authSession.flash('createdApiKey', await apiKey.createApiKey(data));

    return redirect(getRoute('/settings/api-keys'), {
      headers: {
        'Set-Cookie': await commitAuthSession(authSession),
      },
    });
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
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger onClick={(e) => e.stopPropagation()} render={<Button type="button" />}>
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

  const form = useForm({
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'PATCH',
          action: getRoute('/ressources/settings/api-keys/create'),
          encType: 'application/json',
        });
      }
    },
    defaultValues: { description: '', role: 'API_CLIENT' } as CreateApiKeyForm,
    validators: {
      onChange: createApiKeyFormSchema,
      onBlur: createApiKeyFormSchema,
      onSubmit: createApiKeyFormSchema,
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
      <ModalV2.Title>{t('settings:api_keys.new_api_key')}</ModalV2.Title>
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <form.Field name="description">
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name}>{t('settings:api_keys.description')}</FormLabel>
              <FormInput
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                valid={field.state.meta.errors.length === 0}
                type="text"
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field name="role">
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name}>{t('settings:api_keys.role')}</FormLabel>
              <Select.Default
                name={field.name}
                disabled={apiKeyRoleOptions.length === 1}
                defaultValue={field.state.value}
                borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
              >
                {apiKeyRoleOptions.map((role) => (
                  <Select.DefaultItem key={role} value={role}>
                    {t(tKeyForApiKeyRole(role))}
                  </Select.DefaultItem>
                ))}
              </Select.Default>
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close render={<Button type="button" className="flex-1" variant="secondary" />}>
            {t('common:cancel')}
          </ModalV2.Close>
          <Button className="flex-1" variant="primary" type="submit">
            {t('settings:api_keys.create')}
          </Button>
        </div>
      </div>
    </form>
  );
};
