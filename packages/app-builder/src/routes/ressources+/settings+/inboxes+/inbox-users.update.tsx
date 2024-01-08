import { FormError } from '@app-builder/components/Form/FormError';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { tKeyForInboxUserRole } from '@app-builder/routes/_builder+/settings+/inboxes._index';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { type InboxUserDto } from 'marble-api';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

const roleOptions = ['member', 'admin'] as const;

const updateInboxUserFormSchema = z.object({
  id: z.string().uuid(),
  inbox_id: z.string().uuid(),
  role: z.enum(roleOptions),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const formData = await request.formData();
  const submission = parse(formData, { schema: updateInboxUserFormSchema });

  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission);
  }

  try {
    await apiClient.updateInboxUser(submission.value.id, {
      role: submission.value.role,
    });
    return redirect(
      getRoute('/settings/inboxes/:inboxId', {
        inboxId: fromUUID(submission.value.inbox_id),
      }),
    );
  } catch (error) {
    const session = await getSession(request);

    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(submission, {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }
}

export function UpdateInboxUser({ inboxUser }: { inboxUser: InboxUserDto }) {
  const { t } = useTranslation(handle.i18n);
  const [open, setOpen] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <Icon
          icon="edit"
          className="size-6 shrink-0"
          aria-label={t('settings:tags.update_tag')}
        />
      </Modal.Trigger>
      <Modal.Content>
        <UpdateInboxUserContent currentInboxUser={inboxUser} />
      </Modal.Content>
    </Modal.Root>
  );
}

export function UpdateInboxUserContent({
  currentInboxUser,
}: {
  currentInboxUser: InboxUserDto;
}) {
  const { t } = useTranslation(handle.i18n);

  const fetcher = useFetcher<typeof action>();

  const formId = useId();
  const [form, { id, inbox_id, role }] = useForm({
    id: formId,
    defaultValue: currentInboxUser,
    lastSubmission: fetcher.data,
    constraint: getFieldsetConstraint(updateInboxUserFormSchema),
    onValidate({ formData }) {
      return parse(formData, {
        schema: updateInboxUserFormSchema,
      });
    },
  });

  return (
    <fetcher.Form
      method="patch"
      action={getRoute('/ressources/settings/inboxes/inbox-users/update')}
      {...form.props}
    >
      <Modal.Title>{t('settings:inboxes.inbox_user.update')}</Modal.Title>
      <div className="bg-grey-00 flex flex-col gap-6 p-6">
        <input {...conform.input(id, { type: 'hidden' })} />
        <input {...conform.input(inbox_id, { type: 'hidden' })} />
        <FormField
          config={role}
          className="text-s group flex flex-col gap-2 font-bold"
        >
          <FormLabel>{t('settings:inboxes.inbox_details.role')}</FormLabel>
          <FormSelect.Default config={role}>
            {roleOptions.map((role) => (
              <FormSelect.DefaultItem key={role} value={role}>
                {t(tKeyForInboxUserRole(role))}
              </FormSelect.DefaultItem>
            ))}
          </FormSelect.Default>
          <FormError />
        </FormField>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            className="flex-1"
            variant="primary"
            type="submit"
            name="update"
          >
            {t('common:save')}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
}
