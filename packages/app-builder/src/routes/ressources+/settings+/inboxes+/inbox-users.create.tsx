import { FormError } from '@app-builder/components/Form/FormError';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { tKeyForInboxUserRole } from '@app-builder/routes/_builder+/settings+/inboxes._index';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

const roleOptions = ['member', 'admin'] as const;

const createInboxUserFormSchema = z.object({
  userId: z.string().uuid(),
  inboxId: z.string().uuid(),
  role: z.enum(roleOptions),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parse(formData, { schema: createInboxUserFormSchema });

  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission);
  }

  try {
    await apiClient.addInboxUser(submission.value.inboxId, {
      user_id: submission.value.userId,
      role: submission.value.role,
    });
    return redirect(
      getRoute('/settings/inboxes/:inboxId', {
        inboxId: fromUUID(submission.value.inboxId),
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

export function CreateInboxUser({ inboxId }: { inboxId: string }) {
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
      <Modal.Trigger asChild onClick={(e) => e.stopPropagation()}>
        <Button>
          <Icon icon="plus" className="size-6" />
          {t('settings:inboxes.inbox_details.add_member')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <CreateInboxUserContent currentInboxId={inboxId} />
      </Modal.Content>
    </Modal.Root>
  );
}

export function CreateInboxUserContent({
  currentInboxId,
}: {
  currentInboxId: string;
}) {
  const { t } = useTranslation(handle.i18n);

  const fetcher = useFetcher<typeof action>();

  const formId = useId();
  const [form, { userId, inboxId, role }] = useForm({
    id: formId,
    defaultValue: { userId: '', inboxId: currentInboxId, role: 'member' },
    lastSubmission: fetcher.data,
    constraint: getFieldsetConstraint(createInboxUserFormSchema),
    onValidate({ formData }) {
      return parse(formData, {
        schema: createInboxUserFormSchema,
      });
    },
  });

  const { orgUsers } = useOrganizationUsers();
  const userOptions = orgUsers.map((user) => ({
    id: user.userId,
    name: `${user.firstName} ${user.lastName}`,
  }));

  return (
    <fetcher.Form
      method="post"
      action={getRoute('/ressources/settings/inboxes/inbox-users/create')}
      {...form.props}
    >
      <Modal.Title>
        {t('settings:inboxes.inbox_details.add_member')}
      </Modal.Title>
      <div className="bg-grey-00 flex flex-col gap-6 p-6">
        <input {...conform.input(inboxId, { type: 'hidden' })} />
        <FormField
          config={userId}
          className="text-s group flex flex-col gap-2 font-bold"
        >
          <FormLabel>{t('settings:inboxes.inbox_details.user')}</FormLabel>
          <FormSelect.Default config={userId}>
            {userOptions.map(({ id, name }) => (
              <FormSelect.DefaultItem key={id} value={id}>
                {name}
              </FormSelect.DefaultItem>
            ))}
          </FormSelect.Default>
          <FormError />
        </FormField>
        <FormField config={role} className="group flex flex-col gap-2">
          <FormLabel>{t('settings:inboxes.inbox_details.role')}</FormLabel>
          <FormSelect.Default config={role}>
            {roleOptions.map((role) => (
              <Select.DefaultItem key={role} value={role}>
                {t(tKeyForInboxUserRole(role))}
              </Select.DefaultItem>
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
            name="create"
          >
            <Icon icon="new-inbox" className="size-6" />
            {t('settings:inboxes.inbox_details.create_user')}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
}
