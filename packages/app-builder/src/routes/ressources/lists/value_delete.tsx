import { authenticator } from '@app-builder/services/auth/auth.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { type ActionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { Button, HiddenInputs, Modal } from '@ui-design-system';
import { Delete } from '@ui-icons';
import { type Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const handle = {
  i18n: ['lists', 'navigation', 'common'] satisfies Namespace,
};

const deleteValueFormSchema = z.object({
  listId: z.string().uuid(),
  listValueId: z.string().uuid(),
});

export async function action({ request }: ActionArgs) {
  const { apiClient } = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const parsedForm = await parseFormSafe(request, deleteValueFormSchema);
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: parsedForm.formData,
      error: parsedForm.error.format(),
    });
  }
  const { listId, listValueId } = parsedForm.data;
  await apiClient.deleteCustomListValue(listId, { id: listValueId });

  return json({
    success: true as const,
    values: parsedForm.data,
    error: null,
  });
}
export function DeleteListValue({
  listId,
  listValueId,
  value,
  children,
}: {
  listId: string;
  listValueId: string;
  value: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (fetcher.data?.success) {
      setIsOpen(false);
    }
  }, [fetcher.data?.success]);
  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <fetcher.Form method="DELETE" action="/ressources/lists/value_delete">
          <HiddenInputs listId={listId} listValueId={listValueId} />
          <div className="bg-grey-00 flex flex-col gap-8 p-8">
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <div className="bg-red-10 mb-8 box-border rounded-[90px] p-4">
                <Delete width={'64px'} height={'64px'} color="red" />
              </div>
              <h1 className="text-xl font-semibold">
                {t('lists:delete_value.title')}
              </h1>
              <p className="pb-4 text-center">
                {t('lists:delete_value.value_content')} <br />
                <b>{value}</b>
              </p>
              <p className="text-center">{t('lists:delete_value.no_return')}</p>
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
                <p>{t('common:delete')}</p>
              </Button>
            </div>
          </div>
        </fetcher.Form>
      </Modal.Content>
    </Modal.Root>
  );
}
