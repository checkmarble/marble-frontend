import { initServerServices } from '@app-builder/services/init.server';
import { parseForm } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

const deleteUserFormSchema = z.object({
  userId: z.uuid(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await parseForm(request, deleteUserFormSchema);

  await apiClient.deleteUser(formData.userId);
  return redirect(getRoute('/settings/users'));
}

export function DeleteUser({ userId, currentUserId }: { userId: string; currentUserId?: string }) {
  const { t } = useTranslation(handle.i18n);

  if (userId === currentUserId) {
    return (
      <Icon
        icon="delete"
        className="group-hover:text-grey-80 size-6 shrink-0 cursor-not-allowed"
        aria-label={t('settings:users.delete_user')}
      />
    );
  }

  return (
    <Modal.Root>
      <Modal.Trigger>
        <Icon
          icon="delete"
          className="size-6 shrink-0"
          aria-label={t('settings:users.delete_user')}
        />
      </Modal.Trigger>
      <Modal.Content>
        <DeleteUserContent userId={userId} />
      </Modal.Content>
    </Modal.Root>
  );
}

const DeleteUserContent = ({ userId }: { userId: string }) => {
  const { t } = useTranslation(handle.i18n);

  return (
    <Form action={getRoute('/ressources/settings/users/delete')} method="DELETE">
      <Modal.Title>{t('settings:users.delete_user.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex flex-1 flex-col gap-4">
          <input name="userId" value={userId} type="hidden" />
          <p className="text-center">{t('settings:users.delete_user.content')}</p>
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
