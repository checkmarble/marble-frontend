import { CalloutV2, CollapsiblePaper, Page } from '@app-builder/components';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { FormSelectTimezone } from '@app-builder/components/Settings/FormSelectTimezone';
import { isAdmin } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { UTC, validTimezones } from '@app-builder/utils/validTimezones';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { decode as formDataToObject } from 'decode-formdata';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { z } from 'zod';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { organization: repository, user } = await authService.isAuthenticated(
    request,
    { failureRedirect: getRoute('/sign-in') },
  );

  return json({
    organization: await repository.getCurrentOrganization(),
    user,
  });
}

const editOrganizationSchema = z.object({
  organizationId: z.string().min(1),
  defaultScenarioTimezone: z.string(),
  sanctionThreshold: z.coerce.number().min(0).max(100),
  sanctionLimit: z.coerce.number().min(0),
});

type EditOrganizationForm = z.infer<typeof editOrganizationSchema>;

export async function action({ request }: LoaderFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;

  const [session, formData, { organization: repository }] = await Promise.all([
    getSession(request),
    request.formData(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const formDataDecoded = formDataToObject(formData);

  try {
    const data = editOrganizationSchema.parse(formDataDecoded);

    await repository.updateOrganization({
      organizationId: data.organizationId,
      changes: data,
    });

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return json(
      { status: 'success' },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(
      { status: 'error' },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export default function Users() {
  const { t } = useTranslation(['settings', 'common']);
  const { organization, user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const form = useForm<EditOrganizationForm>({
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) fetcher.submit(value, { method: 'PATCH' });
    },
    validators: {
      onChange: editOrganizationSchema,
      onBlur: editOrganizationSchema,
      onSubmit: editOrganizationSchema,
    },
    defaultValues: {
      organizationId: organization.id,
      defaultScenarioTimezone: organization.defaultScenarioTimezone ?? UTC,
      sanctionLimit: organization.sanctionLimit ?? 0,
      sanctionThreshold: organization.sanctionThreshold ?? 0,
    },
  });

  return (
    <Page.Container>
      <Page.Content className="max-w-screen-xl">
        <form
          className="flex flex-col gap-8"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="flex items-center justify-between">
            <CalloutV2>{t('settings:scenario_sanction_callout')}</CalloutV2>
            <Button type="submit" variant="primary">
              {t('common:save')}
            </Button>
          </div>
          <CollapsiblePaper.Container>
            <CollapsiblePaper.Title>
              <span className="flex-1">
                {t('settings:scenenario_execution')}
              </span>
            </CollapsiblePaper.Title>
            <CollapsiblePaper.Content>
              <input
                type="hidden"
                name="organizationId"
                value={organization.id}
              />
              <form.Field name="defaultScenarioTimezone">
                {(field) => (
                  <div className="flex w-full items-center justify-between">
                    <FormLabel name={field.name}>
                      {t('settings:scenario_default_timezone.label')}
                    </FormLabel>
                    <FormSelectTimezone
                      name={field.name}
                      disabled={!isAdmin(user)}
                      selectedTimezone={field.state.value}
                      validTimezones={validTimezones}
                      onBlur={field.handleBlur}
                      onSelectedValueChange={field.handleChange}
                    />
                  </div>
                )}
              </form.Field>
            </CollapsiblePaper.Content>
          </CollapsiblePaper.Container>
          <CollapsiblePaper.Container>
            <CollapsiblePaper.Title>
              <span className="flex-1">
                {t('settings:scenario_sanction_settings')}
              </span>
            </CollapsiblePaper.Title>
            <CollapsiblePaper.Content>
              <div className="flex flex-col gap-6 lg:gap-8">
                <form.Field name="sanctionLimit">
                  {(field) => (
                    <div className="flex flex-col gap-4">
                      <FormLabel
                        name={field.name}
                        className="text-m"
                        valid={field.state.meta.errors.length === 0}
                      >
                        {t('settings:scenario_sanction_limit')}
                      </FormLabel>
                      <FormInput
                        defaultValue={field.state.value}
                        type="number"
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(+e.currentTarget.value)
                        }
                        placeholder={t(
                          'settings:scenario_sanction_limit_placeholder',
                        )}
                        valid={field.state.meta.errors.length === 0}
                      />
                      <FormErrorOrDescription
                        errors={field.state.meta.errors}
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="sanctionThreshold">
                  {(field) => (
                    <div className="flex flex-col gap-4">
                      <FormLabel
                        name={field.name}
                        className="text-m"
                        valid={field.state.meta.errors.length === 0}
                      >
                        {t('settings:scenario_sanction_threshold')}
                      </FormLabel>
                      <FormInput
                        defaultValue={field.state.value}
                        type="number"
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(+e.currentTarget.value)
                        }
                        placeholder={t(
                          'settings:scenario_sanction_threshold_placeholder',
                        )}
                        valid={field.state.meta.errors.length === 0}
                      />
                      <FormErrorOrDescription
                        errors={field.state.meta.errors}
                      />
                    </div>
                  )}
                </form.Field>
              </div>
            </CollapsiblePaper.Content>
          </CollapsiblePaper.Container>
        </form>
      </Page.Content>
    </Page.Container>
  );
}
