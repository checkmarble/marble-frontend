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
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2, TextArea } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

const createAlertFormSchema = z.object({
  transferId: z.string(),
  message: messageSchema,
  transferEndToEndId: transferEndToEndIdSchema.optional(),
  senderIban: senderIbanSchema.optional(),
  beneficiaryIban: beneficiaryIbanSchema.optional(),
});

type CreateAlertForm = z.infer<typeof createAlertFormSchema>;

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

  const { error, success, data } = createAlertFormSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: z.treeifyError(error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await transferAlertRepository.createAlert(data);

    setToastMessage(session, {
      type: 'success',
      message: t('transfercheck:alert.create.success'),
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
    if (fetcher?.data?.status === 'success') {
      setOpen(false);
    }
  }, [setOpen, fetcher?.data?.status]);

  const form = useForm({
    defaultValues: { ...defaultValue, message: '' } as CreateAlertForm,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'PATCH',
          action: getRoute('/transfercheck/ressources/alert/create'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onSubmit: createAlertFormSchema,
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
      <ModalV2.Title>{t('transfercheck:alert.create.title')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <form.Field
          name="message"
          validators={{
            onChange: createAlertFormSchema.shape.message,
            onBlur: createAlertFormSchema.shape.message,
          }}
        >
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
        <form.Field
          name="transferEndToEndId"
          validators={{
            onChange: createAlertFormSchema.shape.transferEndToEndId,
            onBlur: createAlertFormSchema.shape.transferEndToEndId,
          }}
        >
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
        <form.Field
          name="senderIban"
          validators={{
            onChange: createAlertFormSchema.shape.senderIban,
            onBlur: createAlertFormSchema.shape.senderIban,
          }}
        >
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
        <form.Field
          name="beneficiaryIban"
          validators={{
            onChange: createAlertFormSchema.shape.beneficiaryIban,
            onBlur: createAlertFormSchema.shape.beneficiaryIban,
          }}
        >
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
          <Button className="flex-1" variant="primary" type="submit" name="create">
            <Icon icon="add-alert" className="size-5" />
            {t('transfercheck:alert.create.new_alert')}
          </Button>
        </div>
      </div>
    </form>
  );
}
