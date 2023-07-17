import { authenticator } from '@app-builder/services/auth/auth.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { type ActionArgs, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { Button, HiddenInputs, Modal } from '@ui-design-system';
import { Delete } from '@ui-icons';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const handle = {
  i18n: ['lists', 'navigation', 'common'] satisfies Namespace,
};

const deleteListFormSchema = z.object({
  listId: z.string().uuid(),
});

export async function action({ request }: ActionArgs) {
  const { apiClient } = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const parsedForm = await parseFormSafe(request, deleteListFormSchema);
  if (!parsedForm.success) {
    // TODO check error
    return null;
  }
  const { listId } = parsedForm.data;
  await apiClient.deleteCustomList(listId);
  return redirect('/lists');
}

export function DeleteList({ listId }: { listId: string }) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button color="red" className="w-fit">
          <Delete width={'24px'} height={'24px'} />
          <p>{t('lists:delete_list.button')}</p>
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <fetcher.Form method="DELETE" action="/ressources/lists/delete">
          <HiddenInputs listId={listId} />
          <div className="bg-grey-00 flex flex-col gap-8 p-8">
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <div className="bg-red-10 mb-8 box-border rounded-[90px] p-4">
                <Delete width={'64px'} height={'64px'} color="red" />
              </div>
              <h1 className="text-xl font-semibold">
                {t('lists:delete_list.title')}
              </h1>
              <p className="text-center">{t('lists:delete_list.content')}</p>
            </div>
            <div className="flex flex-1 flex-row gap-2">
              <Modal.Close asChild>
                <Button className="flex-1" variant="secondary">
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
        </fetcher.Form>
      </Modal.Content>
    </Modal.Root>
  );
}
