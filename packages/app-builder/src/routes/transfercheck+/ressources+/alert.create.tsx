import { FormError } from '@app-builder/components/Form/FormError';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormTextArea } from '@app-builder/components/Form/FormTextArea';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const createAlertFormSchema = z.object({
  transferId: z.string(),
  message: z.string({ required_error: 'required' }),
  transferEndToEndId: z.string(),
  senderIban: z.string(),
  beneficiaryIban: z.string(),
});

type CreateAlertForm = z.infer<typeof createAlertFormSchema>;

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
  const submission = parse(formData, { schema: createAlertFormSchema });

  if (submission.intent !== 'submit' || !submission.value) {
    return json({ submission, success: false });
  }

  try {
    await transferAlertRepository.createAlert(submission.value);

    const session = await getSession(request);
    const t = await getFixedT(request, ['transfercheck']);

    setToastMessage(session, {
      type: 'success',
      message: t('transfercheck:alert.create.success'),
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

export function CreateAlert({
  defaultValue,
  children,
}: {
  defaultValue: Pick<CreateAlertForm, 'transferId'>;
  children: React.ReactElement;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content>
        <CreateAlertContent defaultValue={defaultValue} setOpen={setOpen} />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

function CreateAlertContent({
  defaultValue,
  setOpen,
}: {
  defaultValue: Pick<CreateAlertForm, 'transferId'>;
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslation(['common', 'transfercheck']);

  const fetcher = useFetcher<typeof action>();
  React.useEffect(() => {
    if (fetcher?.data?.success) {
      setOpen(false);
    }
  }, [setOpen, fetcher?.data?.success]);

  const formId = React.useId();
  const [form, fields] = useForm({
    id: formId,
    defaultValue: { ...defaultValue, message: '' },
    lastSubmission: fetcher.data?.submission,
    constraint: getFieldsetConstraint(createAlertFormSchema),
    onValidate({ formData }) {
      return parse(formData, {
        schema: createAlertFormSchema,
      });
    },
  });

  return (
    <fetcher.Form
      method="post"
      action={getRoute('/transfercheck/ressources/alert/create')}
      {...form.props}
    >
      <ModalV2.Title>{t('transfercheck:alert.create.title')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <input {...conform.input(fields.transferId, { type: 'hidden' })} />
        <FormField
          config={fields.transferEndToEndId}
          className="flex flex-col items-start gap-2"
        >
          <FormLabel>
            {t('transfercheck:alert.transfer_end_to_end_id')}
          </FormLabel>
          <FormInput
            className="w-full"
            placeholder={t(
              'transfercheck:alert.create.transfer_end_to_end_id.placeholder',
            )}
          />
          <FormError />
        </FormField>
        <FormField
          config={fields.senderIban}
          className="flex flex-col items-start gap-2"
        >
          <FormLabel>{t('transfercheck:alert.sender_iban')}</FormLabel>
          <FormInput
            className="w-full"
            placeholder={t(
              'transfercheck:alert.create.sender_iban.placeholder',
            )}
          />
          <FormError />
        </FormField>
        <FormField
          config={fields.beneficiaryIban}
          className="flex flex-col items-start gap-2"
        >
          <FormLabel>{t('transfercheck:alert.beneficiary_iban')}</FormLabel>
          <FormInput
            className="w-full"
            placeholder={t(
              'transfercheck:alert.create.beneficiary_iban.placeholder',
            )}
          />
          <FormError />
        </FormField>
        <FormField
          config={fields.message}
          className="flex flex-col items-start gap-2"
        >
          <FormLabel>{t('transfercheck:alert.create.message')}</FormLabel>
          <FormTextArea
            className="w-full"
            placeholder={t('transfercheck:alert.create.message.placeholder')}
          />
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
            <Icon icon="add-alert" className="size-5" />
            {t('transfercheck:alert.create.new_alert')}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
}
