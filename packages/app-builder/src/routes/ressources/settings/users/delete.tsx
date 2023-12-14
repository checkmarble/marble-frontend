import { serverServices } from '@app-builder/services/init.server';
import { parseForm } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionArgs, redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Delete } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

const deleteUserFormSchema = z.object({
  userId: z.string().uuid(),
});

export async function action({ request }: ActionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const formData = await parseForm(request, deleteUserFormSchema);

  await apiClient.deleteUser(formData.userId);
  return redirect(getRoute('/settings/users'));
}

export function DeleteUser({ userId }: { userId: string }) {
  const { t } = useTranslation(handle.i18n);

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Delete
          width="24px"
          height="24px"
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
    <Form action="/ressources/settings/users/delete" method="DELETE">
      <Modal.Title>{t('settings:users.delete_user.title')}</Modal.Title>
      <div className="bg-grey-00 flex flex-col gap-8 p-8">
        <div className="text-s flex flex-1 flex-col gap-4">
          <input name="userId" value={userId} type="hidden" />
          <p className="text-center">
            {t('settings:users.delete_user.content')}
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
            <Delete width={'24px'} height={'24px'} />
            {t('common:delete')}
          </Button>
        </div>
      </div>
    </Form>
  );
};
