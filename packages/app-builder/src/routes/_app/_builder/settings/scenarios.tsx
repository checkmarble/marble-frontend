import { Callout, Page } from '@app-builder/components';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { ScreeningThreshold } from '@app-builder/components/ScreeningThreshold';
import { FormSelectTimezone } from '@app-builder/components/Settings/FormSelectTimezone';
import { SettingCard } from '@app-builder/components/Settings/settingCard';
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
import { Button, Card, NumberInput } from 'ui-design-system';

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
    <Page.Content width="readable">
      <form
        className="flex flex-col gap-md"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex items-center justify-between">
          <Callout variant="outlined" iconColor="purple">
            {t('settings:scenario_sanction_callout')}
          </Callout>
          <Button type="submit" variant="primary" appearance="stroked">
            {t('settings:save-settings')}
          </Button>
        </div>
        <SettingCard title={t('settings:scenenario_execution')}>
          <Card className="p-md">
            <form.Field name="defaultScenarioTimezone">
              {(field) => (
                <div className="flex w-full lg:w-1/2 items-center justify-between">
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
          </Card>
        </SettingCard>

        {entitlements.sanctions !== 'restricted' ? (
          <SettingCard title={t('settings:scenario_sanction_settings')}>
            <Card className="p-md">
              <div className="flex flex-col gap-lg lg:gap-xl w-full lg:w-1/2">
                <form.Field name="sanctionLimit">
                  {(field) => (
                    <div>
                      <div className="flex items-center justify-between gap-lg">
                        <label htmlFor={field.name} className="text-s text-grey-secondary">
                          {t('settings:scenario_sanction_limit')}
                        </label>
                        <NumberInput
                          id={field.name}
                          type="number"
                          name={field.name}
                          value={field.state.value ?? 0}
                          onChange={(value) => field.handleChange(value)}
                          onBlur={field.handleBlur}
                          placeholder={t('settings:scenario_sanction_limit_placeholder')}
                          borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
                        />
                      </div>
                      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                    </div>
                  )}
                </form.Field>
                <form.Field name="sanctionThreshold">
                  {(field) => (
                    <div>
                      <div className="flex gap-md">
                        <ScreeningThreshold
                          threshold={field.state.value}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          title={t('settings:scenario_sanction_threshold')}
                          direction="row"
                          className="w-full"
                        />
                      </div>
                      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                    </div>
                  )}
                </form.Field>
              </div>
            </Card>
          </SettingCard>
        ) : null}
      </form>
    </Page.Content>
  );
}
