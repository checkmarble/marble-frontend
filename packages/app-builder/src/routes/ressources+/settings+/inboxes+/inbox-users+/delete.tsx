import { type InboxUser } from '@app-builder/models/inbox';
import { initServerServices } from '@app-builder/services/init.server';
import { parseForm } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form, useNavigation } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

const deleteInboxUserFormSchema = z.object({
  inboxId: z.uuid(),
  inboxUserId: z.uuid(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await parseForm(request, deleteInboxUserFormSchema);

  await inbox.deleteInboxUser(formData.inboxUserId);
  return redirect(
    getRoute('/settings/inboxes/:inboxId', {
      inboxId: fromUUIDtoSUUID(formData.inboxId),
    }),
  );
}

export function DeleteInboxUser({ inboxUser }: { inboxUser: InboxUser }) {
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
          icon="delete"
          className="size-6 shrink-0"
          aria-label={t('settings:inboxes.inbox_user.delete')}
        />
      </Modal.Trigger>
      <Modal.Content>
        <DeleteInboxUserContent inboxUser={inboxUser} />
      </Modal.Content>
    </Modal.Root>
  );
}

const DeleteInboxUserContent = ({ inboxUser }: { inboxUser: InboxUser }) => {
  const { t } = useTranslation(handle.i18n);

  return (
    <Form action={getRoute('/ressources/settings/inboxes/inbox-users/delete')} method="DELETE">
      <Modal.Title>{t('settings:inboxes.inbox_user.delete')}</Modal.Title>
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <div className="text-s flex flex-1 flex-col gap-4">
          <input name="inboxUserId" value={inboxUser.id} type="hidden" />
          <input name="inboxId" value={inboxUser.inboxId} type="hidden" />
          <p className="text-center">{t('settings:inboxes.inbox_user.delete.content')}</p>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button color="red" className="flex-1" variant="primary" type="submit" name="delete">
            <Icon icon="delete" className="size-6" />
            {t('common:delete')}
          </Button>
        </div>
      </div>
    </Form>
  );
};
