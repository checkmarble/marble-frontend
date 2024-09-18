import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useHydrated } from 'remix-utils/use-hydrated';
import { Button, HiddenInputs, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['lists', 'navigation', 'common'] satisfies Namespace,
};

const deleteListFormSchema = z.object({
  listId: z.string().uuid(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { customListsRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const parsedForm = await parseFormSafe(request, deleteListFormSchema);
  if (!parsedForm.success) {
    // TODO check error
    return null;
  }
  const { listId } = parsedForm.data;
  await customListsRepository.deleteCustomList(listId);
  return redirect('/lists');
}

export function DeleteList({ listId }: { listId: string }) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();
  const hydrated = useHydrated();

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button color="red" className="w-fit" disabled={!hydrated}>
          <Icon icon="delete" className="size-6" />
          <p>{t('lists:delete_list.button')}</p>
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <fetcher.Form
          method="DELETE"
          action={getRoute('/ressources/lists/delete')}
        >
          <HiddenInputs listId={listId} />
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <div className="bg-red-10 mb-6 box-border rounded-[90px] p-4">
                <Icon icon="delete" className="size-16 text-red-100" />
              </div>
              <h1 className="text-l font-semibold">
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
                <Icon icon="delete" className="size-6" />
                {t('common:delete')}
              </Button>
            </div>
          </div>
        </fetcher.Form>
      </Modal.Content>
    </Modal.Root>
  );
}
