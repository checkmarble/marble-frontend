import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  AlertStatus,
  alertStatusMapping,
  alertStatusVariants,
  useAlertStatuses,
} from '@app-builder/components/TransferAlerts/AlertStatus';
import { transferAlerStatuses } from '@app-builder/models/transfer-alert';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { Select } from 'ui-design-system';
import { z } from 'zod/v4';

const updateAlertStatusFormSchema = z.object({
  alertId: z.string(),
  status: z.enum(transferAlerStatuses),
});

type UpdateAlertStatusForm = z.infer<typeof updateAlertStatusFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, t, rawData, { transferAlertRepository }] = await Promise.all([
    getSession(request),
    getFixedT(request, ['transfercheck', 'common']),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { error, success, data } = updateAlertStatusFormSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: z.treeifyError(error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await transferAlertRepository.updateReceivedAlert(data);

    setToastMessage(session, {
      type: 'success',
      message: t('transfercheck:alert.update.success'),
    });

    return json(
      { status: 'success', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  } catch (_error) {
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

export function UpdateAlertStatus({ defaultValue }: { defaultValue: UpdateAlertStatusForm }) {
  const { t } = useTranslation(['transfercheck']);
  const fetcher = useFetcher<typeof action>();
  const alertStatuses = useAlertStatuses();

  const form = useForm({
    defaultValues: defaultValue,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'PATCH',
          action: getRoute('/transfercheck/ressources/alert/update/status'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onSubmitAsync: updateAlertStatusFormSchema,
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
      <form.Field
        name="status"
        validators={{
          onChange: updateAlertStatusFormSchema.shape.status,
          onBlur: updateAlertStatusFormSchema.shape.status,
        }}
      >
        {(field) => (
          <div className="group flex flex-row items-center gap-4">
            <FormLabel name={field.name} className="sr-only">
              {t('transfercheck:alerts.status')}
            </FormLabel>
            <Select.Root
              onValueChange={(value) => {
                field.handleChange(value as UpdateAlertStatusForm['status']);
                form.handleSubmit();
              }}
            >
              <Select.Trigger>
                <Select.Value
                  className={alertStatusVariants({
                    color: alertStatusMapping[field.state.value].color,
                    variant: 'text',
                  })}
                >
                  {t(alertStatusMapping[field.state.value].tKey)}
                </Select.Value>
                <Select.Arrow />
              </Select.Trigger>
              <Select.Content
                className="max-h-60 min-w-[var(--radix-select-trigger-width)]"
                align="start"
              >
                <Select.Viewport>
                  {alertStatuses.map((status) => (
                    <Select.Item
                      key={status.value}
                      value={status.value}
                      className="flex flex-row items-center gap-2"
                    >
                      <AlertStatus status={status.value} />
                      <Select.ItemText>{status.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Root>
          </div>
        )}
      </form.Field>
    </form>
  );
}
