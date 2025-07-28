import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

const editOrganizationSchema = z.object({
  organizationId: z.string().min(1),
  autoAssignQueueLimit: z.coerce.number().min(0).optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, rawData, { organization }] = await Promise.all([
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = editOrganizationSchema.safeParse(rawData);
  if (!success) {
    return Response.json(
      { status: 'error', errors: error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    const { organizationId, autoAssignQueueLimit } = data;
    await organization.updateOrganization({
      organizationId,
      changes: { autoAssignQueueLimit },
    });

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return Response.json(
      { status: 'success' },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return Response.json(
      { status: 'error' },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export function UpdateGlobalSettings({
  organizationId,
  autoAssignQueueLimit,
}: {
  organizationId: string;
  autoAssignQueueLimit: number;
}) {
  const { t } = useTranslation(handle.i18n);
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild onClick={(e) => e.stopPropagation()}>
        <Button className="w-fit whitespace-nowrap">
          <Icon icon="edit-square" className="size-6" />
          {t('common:edit')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <UpdateGlobalSettingsContents
          organizationId={organizationId}
          autoAssignQueueLimit={autoAssignQueueLimit}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

export function UpdateGlobalSettingsContents({
  organizationId,
  autoAssignQueueLimit,
}: {
  organizationId: string;
  autoAssignQueueLimit: number;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const form = useForm({
    defaultValues: {
      organizationId,
      autoAssignQueueLimit,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'PATCH',
          action: getRoute('/ressources/settings/inboxes/global/update'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onSubmit: editOrganizationSchema,
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
      <Modal.Title>{t('settings:global_settings.title')}</Modal.Title>
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <form.Field
          name="autoAssignQueueLimit"
          validators={{
            onChange: editOrganizationSchema.shape.autoAssignQueueLimit,
            onBlur: editOrganizationSchema.shape.autoAssignQueueLimit,
          }}
        >
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name}>
                {t('settings:global_settings.auto_assign_queue_limit')}
              </FormLabel>
              <FormInput
                type="number"
                min={0}
                step={1}
                placeholder={t('settings:global_settings.auto_assign_queue_limit_placeholder')}
                max={1000}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(+e.currentTarget.value)}
                defaultValue={field.state.value}
                valid={field.state.meta.errors.length === 0}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>

        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" type="button">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button className="flex-1" variant="primary" type="submit" name="update">
            {t('common:save')}
          </Button>
        </div>
      </div>
    </form>
  );
}
