import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  AlertStatus,
  alertStatusMapping,
  alertStatusVariants,
  useAlertStatuses,
} from '@app-builder/components/TransferAlerts/AlertStatus';
import { transferAlerStatuses } from '@app-builder/models/transfer-alert';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

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
  } = serverServices;
  const { transferAlertRepository } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: getRoute('/sign-in'),
    },
  );

  const formData = await request.formData();
  const submission = parse(formData, { schema: updateAlertStatusFormSchema });

  if (submission.intent !== 'submit' || !submission.value) {
    return json({ submission, success: false });
  }

  try {
    await transferAlertRepository.updateReceivedAlert(submission.value);

    const session = await getSession(request);
    const t = await getFixedT(request, ['transfercheck']);

    setToastMessage(session, {
      type: 'success',
      message: t('transfercheck:alert.update.success'),
    });

    return json(
      { submission, success: true },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  } catch (error) {
    const session = await getSession(request);
    const t = await getFixedT(request, ['common']);

    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return json(
      { submission, success: false },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export function UpdateAlertStatus({
  defaultValue,
}: {
  defaultValue: UpdateAlertStatusForm;
}) {
  const { t } = useTranslation(['transfercheck']);
  const fetcher = useFetcher<typeof action>();
  const alertStatuses = useAlertStatuses();

  const formId = React.useId();
  const [form, fields] = useForm({
    id: formId,
    defaultValue,
    lastSubmission: fetcher.data?.submission,
    constraint: getFieldsetConstraint(updateAlertStatusFormSchema),
    onValidate({ formData }) {
      return parse(formData, {
        schema: updateAlertStatusFormSchema,
      });
    },
  });

  const [status, setStatus] = React.useState(defaultValue.status);
  const { color, tKey } = alertStatusMapping[status];

  return (
    <fetcher.Form
      method="post"
      action={getRoute('/transfercheck/ressources/alert/update/status')}
      {...form.props}
    >
      <input {...conform.input(fields.alertId, { type: 'hidden' })} />
      <FormField
        config={fields.status}
        className="group flex flex-row items-center gap-4"
      >
        <FormLabel className="sr-only">
          {t('transfercheck:alerts.list.status')}
        </FormLabel>
        <FormSelect.Root
          config={fields.status}
          onValueChange={(value) => {
            //@ts-expect-error value is string but indeed, it is a valid status
            setStatus(value);
            form.ref.current?.requestSubmit();
          }}
        >
          <FormSelect.Trigger>
            <FormSelect.Value
              className={alertStatusVariants({ color, variant: 'text' })}
            >
              {t(tKey)}
            </FormSelect.Value>
            <FormSelect.Arrow />
          </FormSelect.Trigger>
          <FormSelect.Content
            className="max-h-60 min-w-[var(--radix-select-trigger-width)]"
            align="start"
          >
            <FormSelect.Viewport>
              {alertStatuses.map((status) => (
                <FormSelect.Item
                  key={status.value}
                  value={status.value}
                  className="flex flex-row items-center gap-2"
                >
                  <AlertStatus status={status.value} />
                  <FormSelect.ItemText>{status.label}</FormSelect.ItemText>
                </FormSelect.Item>
              ))}
            </FormSelect.Viewport>
          </FormSelect.Content>
        </FormSelect.Root>
      </FormField>
    </fetcher.Form>
  );
}
