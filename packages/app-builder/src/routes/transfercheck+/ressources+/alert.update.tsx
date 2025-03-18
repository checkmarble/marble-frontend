import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  beneficiaryIbanSchema,
  messageSchema,
  senderIbanSchema,
  transferEndToEndIdSchema,
} from '@app-builder/models/transfer-alert';
import { serverServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2, TextArea } from 'ui-design-system';
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

  const [session, t, rawData, { transferAlertRepository }] = await Promise.all([
    getSession(request),
    getFixedT(request, ['transfercheck', 'common']),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { error, success, data } = updateAlertFormSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await transferAlertRepository.updateSentAlert(data);

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

export function UpdateAlert({
  defaultValue,
  children,
}: {
  defaultValue: UpdateAlertForm;
  children: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    if (fetcher?.data?.status === 'success') {
      setOpen(false);
    }
  }, [setOpen, fetcher?.data?.status]);

  const form = useForm({
    defaultValues: defaultValue,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/transfercheck/ressources/alert/update'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChange: updateAlertFormSchema,
      onBlur: updateAlertFormSchema,
      onSubmit: updateAlertFormSchema,
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
      <ModalV2.Title>{t('transfercheck:alert.update.title')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <form.Field name="message">
          {(field) => (
            <div className="flex flex-col items-start gap-2">
              <FormLabel name={field.name}>{t('transfercheck:alert.create.message')}</FormLabel>
              <TextArea
                className="w-full"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                placeholder={t('transfercheck:alert.create.message.placeholder')}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field name="transferEndToEndId">
          {(field) => (
            <div className="flex flex-col items-start gap-2">
              <FormLabel name={field.name}>
                {t('transfercheck:alert.transfer_end_to_end_id')}
              </FormLabel>
              <FormInput
                type="text"
                className="w-full"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                valid={field.state.meta.errors.length === 0}
                placeholder={t('transfercheck:alert.create.transfer_end_to_end_id.placeholder')}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field name="senderIban">
          {(field) => (
            <div className="flex flex-col items-start gap-2">
              <FormLabel name={field.name}>{t('transfercheck:alert.sender_iban')}</FormLabel>
              <FormInput
                type="text"
                className="w-full"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                valid={field.state.meta.errors.length === 0}
                placeholder={t('transfercheck:alert.create.sender_iban.placeholder')}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field name="beneficiaryIban">
          {(field) => (
            <div className="flex flex-col items-start gap-2">
              <FormLabel name={field.name}>{t('transfercheck:alert.beneficiary_iban')}</FormLabel>
              <FormInput
                type="text"
                className="w-full"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                valid={field.state.meta.errors.length === 0}
                placeholder={t('transfercheck:alert.create.beneficiary_iban.placeholder')}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>

        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close render={<Button className="flex-1" variant="secondary" />}>
            {t('common:cancel')}
          </ModalV2.Close>
          <Button className="flex-1" variant="primary" type="submit">
            <Icon icon="edit-square" className="size-5" />
            {t('transfercheck:alert.update.submit')}
          </Button>
        </div>
      </div>
    </form>
  );
}
