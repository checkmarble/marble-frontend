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
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
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
  const submission = parseWithZod(formData, {
    schema: updateAlertStatusFormSchema,
  });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    await transferAlertRepository.updateReceivedAlert(submission.value);

    const session = await getSession(request);
    const t = await getFixedT(request, ['transfercheck']);

    setToastMessage(session, {
      type: 'success',
      message: t('transfercheck:alert.update.success'),
    });

    return json(submission.reply(), {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  } catch (error) {
    const session = await getSession(request);
    const t = await getFixedT(request, ['common']);

    const formError = t('common:errors.unknown');

    setToastMessage(session, {
      type: 'error',
      message: formError,
    });

    return json(submission.reply({ formErrors: [formError] }), {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
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

  const [form, fields] = useForm({
    defaultValue,
    lastResult: fetcher.data,
    constraint: getZodConstraint(updateAlertStatusFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: updateAlertStatusFormSchema,
      });
    },
  });

  const formRef = React.useRef<HTMLFormElement>(null);

  const [status, setStatus] = React.useState(defaultValue.status);
  const { color, tKey } = alertStatusMapping[status];

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        ref={formRef}
        method="post"
        action={getRoute('/transfercheck/ressources/alert/update/status')}
        {...getFormProps(form)}
      >
        <input
          {...getInputProps(fields.alertId, { type: 'hidden' })}
          key={fields.alertId.key}
        />
        <FormField
          name={fields.status.name}
          className="group flex flex-row items-center gap-4"
        >
          <FormLabel className="sr-only">
            {t('transfercheck:alerts.status')}
          </FormLabel>
          <FormSelect.Root
            onValueChange={(value) => {
              //@ts-expect-error value is string but indeed, it is a valid status
              setStatus(value);
              formRef.current?.requestSubmit();
            }}
            options={alertStatuses}
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
    </FormProvider>
  );
}
