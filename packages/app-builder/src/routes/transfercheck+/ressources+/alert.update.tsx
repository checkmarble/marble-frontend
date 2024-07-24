import { FormErrorOrDescription } from '@app-builder/components/Form/FormErrorOrDescription';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormTextArea } from '@app-builder/components/Form/FormTextArea';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  beneficiaryIbanSchema,
  messageSchema,
  senderIbanSchema,
  transferEndToEndIdSchema,
} from '@app-builder/models/transfer-alert';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const updateAlertFormSchema = z.object({
  alertId: z.string(),
  message: messageSchema,
  transferEndToEndId: transferEndToEndIdSchema,
  senderIban: senderIbanSchema,
  beneficiaryIban: beneficiaryIbanSchema,
});

type UpdateAlertForm = z.infer<typeof updateAlertFormSchema>;

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
  const submission = parseWithZod(formData, { schema: updateAlertFormSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    await transferAlertRepository.updateSentAlert(submission.value);

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

export function UpdateAlert({
  defaultValue,
  children,
}: {
  defaultValue: UpdateAlertForm;
  children: React.ReactElement;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content>
        <UpdateAlertContent defaultValue={defaultValue} setOpen={setOpen} />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

function UpdateAlertContent({
  defaultValue,
  setOpen,
}: {
  defaultValue: UpdateAlertForm;
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslation(['common', 'transfercheck']);

  const fetcher = useFetcher<typeof action>();
  React.useEffect(() => {
    if (fetcher?.data?.status === 'success') {
      setOpen(false);
    }
  }, [setOpen, fetcher?.data?.status]);

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    defaultValue,
    lastResult: fetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: updateAlertFormSchema,
      });
    },
  });

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        method="post"
        action={getRoute('/transfercheck/ressources/alert/update')}
        {...getFormProps(form)}
      >
        <ModalV2.Title>{t('transfercheck:alert.update.title')}</ModalV2.Title>
        <div className="flex flex-col gap-6 p-6">
          <input
            {...getInputProps(fields.alertId, { type: 'hidden' })}
            key={fields.alertId.key}
          />
          <FormField
            name={fields.message.name}
            className="flex flex-col items-start gap-2"
          >
            <FormLabel>{t('transfercheck:alert.update.message')}</FormLabel>
            <FormTextArea
              className="w-full"
              placeholder={t('transfercheck:alert.update.message.placeholder')}
            />
            <FormErrorOrDescription />
          </FormField>
          <FormField
            name={fields.transferEndToEndId.name}
            className="flex flex-col items-start gap-2"
          >
            <FormLabel>
              {t('transfercheck:alert.transfer_end_to_end_id')}
            </FormLabel>
            <FormInput
              type="text"
              className="w-full"
              placeholder={t(
                'transfercheck:alert.update.transfer_end_to_end_id.placeholder',
              )}
            />
            <FormErrorOrDescription />
          </FormField>
          <FormField
            name={fields.senderIban.name}
            className="flex flex-col items-start gap-2"
          >
            <FormLabel>{t('transfercheck:alert.sender_iban')}</FormLabel>
            <FormInput
              type="text"
              className="w-full"
              placeholder={t(
                'transfercheck:alert.update.sender_iban.placeholder',
              )}
            />
            <FormErrorOrDescription />
          </FormField>
          <FormField
            name={fields.beneficiaryIban.name}
            className="flex flex-col items-start gap-2"
          >
            <FormLabel>{t('transfercheck:alert.beneficiary_iban')}</FormLabel>
            <FormInput
              type="text"
              className="w-full"
              placeholder={t(
                'transfercheck:alert.update.beneficiary_iban.placeholder',
              )}
            />
            <FormErrorOrDescription />
          </FormField>

          <div className="flex flex-1 flex-row gap-2">
            <ModalV2.Close
              render={<Button className="flex-1" variant="secondary" />}
            >
              {t('common:cancel')}
            </ModalV2.Close>
            <Button className="flex-1" variant="primary" type="submit">
              <Icon icon="edit" className="size-5" />
              {t('transfercheck:alert.update.submit')}
            </Button>
          </div>
        </div>
      </fetcher.Form>
    </FormProvider>
  );
}
