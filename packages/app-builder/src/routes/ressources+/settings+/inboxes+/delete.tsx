import { serverServices } from '@app-builder/services/init.server';
import { parseForm } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form, useNavigation } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { type InboxDto } from 'marble-api';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

const deleteInboxFormSchema = z.object({
  inboxId: z.string().uuid(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const formData = await parseForm(request, deleteInboxFormSchema);

  await apiClient.deleteInbox(formData.inboxId);
  return redirect(getRoute('/settings/inboxes/'));
}

export function DeleteInbox({
  inbox,
  disabled,
}: {
  inbox: InboxDto;
  disabled?: boolean;
}) {
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
      <Modal.Trigger asChild>
        <Button
          color="red"
          variant="primary"
          name="delete"
          disabled={disabled}
          className="w-fit"
        >
          <Icon
            icon="delete"
            className="size-6"
            aria-label={t('settings:inboxes.delete_inbox')}
          />
          {t('settings:inboxes.delete_inbox')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <DeleteInboxContent inboxId={inbox.id} />
      </Modal.Content>
    </Modal.Root>
  );
}

const DeleteInboxContent = ({ inboxId }: { inboxId: string }) => {
  const { t } = useTranslation(handle.i18n);

  return (
    <Form
      action={getRoute('/ressources/settings/inboxes/delete')}
      method="DELETE"
    >
      <Modal.Title>{t('settings:inboxes.delete_inbox')}</Modal.Title>
      <div className="bg-grey-00 flex flex-col gap-6 p-6">
        <div className="text-s flex flex-1 flex-col gap-4">
          <input name="inboxId" value={inboxId} type="hidden" />
          <p className="text-center">
            {t('settings:inboxes.delete_inbox.content')}
          </p>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            color="red"
            className="flex-1"
            variant="primary"
            type="submit"
            name="delete"
          >
            <Icon icon="delete" className="size-6" />
            {t('common:delete')}
          </Button>
        </div>
      </div>
    </Form>
  );
};
