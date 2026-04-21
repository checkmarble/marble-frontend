import { CalloutV2, CollapsiblePaper, Page } from '@app-builder/components';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { FormSelectTimezone } from '@app-builder/components/Settings/FormSelectTimezone';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import {
  type UpdateOrganizationScenariosPayload,
  updateOrganizationScenariosPayloadSchema,
} from '@app-builder/schemas/settings';
import { updateOrganizationScenariosFn } from '@app-builder/server-fns/settings';
import { getFieldErrors } from '@app-builder/utils/form';
import { UTC, validTimezones } from '@app-builder/utils/validTimezones';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn, useServerFn } from '@tanstack/react-start';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';

const scenariosLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function scenariosLoader({ context }) {
    const { organization: repository, user, entitlements } = context.authInfo;

    if (!isAdmin(user)) {
      throw redirect({ to: '/' });
    }

    return {
      organization: await repository.getCurrentOrganization(),
      entitlements,
      user,
    };
  });

export const Route = createFileRoute('/_app/_builder/settings/scenarios')({
  loader: () => scenariosLoader(),
  component: Scenarios,
});

function Scenarios() {
  const { t } = useTranslation(['settings', 'common']);
  const { organization, user, entitlements } = Route.useLoaderData();
  const updateOrganizationScenarios = useServerFn(updateOrganizationScenariosFn);
  const revalidate = useLoaderRevalidator();

  const updateMutation = useMutation({
    mutationFn: (value: UpdateOrganizationScenariosPayload) => updateOrganizationScenarios({ data: value }),
  });

  const form = useForm({
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        updateMutation
          .mutateAsync(value)
          .then(() => {
            toast.success(t('common:success.save'));
            revalidate();
          })
          .catch(() => {
            toast.error(t('common:errors.unknown'));
          });
      }
    },
    validators: {
      onChange: updateOrganizationScenariosPayloadSchema as unknown as any,
      onBlur: updateOrganizationScenariosPayloadSchema as unknown as any,
      onSubmit: updateOrganizationScenariosPayloadSchema as unknown as any,
    },
    defaultValues: {
      organizationId: organization.id,
      defaultScenarioTimezone: organization.defaultScenarioTimezone ?? UTC,
      sanctionLimit: organization.sanctionLimit ?? 0,
      sanctionThreshold: organization.sanctionThreshold ?? 0,
    } as UpdateOrganizationScenariosPayload,
  });

  return (
    <Page.Container>
      <Page.Content className="max-w-(--breakpoint-xl)">
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
              <span className="flex-1">{t('settings:scenenario_execution')}</span>
            </CollapsiblePaper.Title>
            <CollapsiblePaper.Content>
              <form.Field name="defaultScenarioTimezone">
                {(field) => (
                  <div className="flex w-full items-center justify-between">
                    <FormLabel name={field.name}>{t('settings:scenario_default_timezone.label')}</FormLabel>
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
          {entitlements.sanctions !== 'restricted' ? (
            <CollapsiblePaper.Container>
              <CollapsiblePaper.Title>
                <span className="flex-1">{t('settings:scenario_sanction_settings')}</span>
              </CollapsiblePaper.Title>
              <CollapsiblePaper.Content>
                <div className="flex flex-col gap-6 lg:gap-8">
                  <form.Field name="sanctionLimit">
                    {(field) => (
                      <div className="flex flex-col gap-4">
                        <FormLabel name={field.name} className="text-m" valid={field.state.meta.errors.length === 0}>
                          {t('settings:scenario_sanction_limit')}
                        </FormLabel>
                        <FormInput
                          defaultValue={field.state.value}
                          type="number"
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(+e.currentTarget.value)}
                          placeholder={t('settings:scenario_sanction_limit_placeholder')}
                          valid={field.state.meta.errors.length === 0}
                        />
                        <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                      </div>
                    )}
                  </form.Field>
                  <form.Field name="sanctionThreshold">
                    {(field) => (
                      <div className="flex flex-col gap-4">
                        <FormLabel name={field.name} className="text-m" valid={field.state.meta.errors.length === 0}>
                          {t('settings:scenario_sanction_threshold')}
                        </FormLabel>
                        <FormInput
                          defaultValue={field.state.value}
                          type="number"
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(+e.currentTarget.value)}
                          placeholder={t('settings:scenario_sanction_threshold_placeholder')}
                          valid={field.state.meta.errors.length === 0}
                        />
                        <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                      </div>
                    )}
                  </form.Field>
                </div>
              </CollapsiblePaper.Content>
            </CollapsiblePaper.Container>
          ) : null}
        </form>
      </Page.Content>
    </Page.Container>
  );
}
