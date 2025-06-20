import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { type TableModel } from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { z } from 'zod';

export const handle = {
  i18n: ['data', 'navigation', 'common'] satisfies Namespace,
};

const editTableFormSchema = z.object({
  description: z.string(),
  tableId: z.string().uuid(),
});

type EditTableForm = z.infer<typeof editTableFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const [raw, { apiClient }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = editTableFormSchema.safeParse(raw);

  if (!success) return json({ success: 'false', errors: error.flatten() });

  try {
    await apiClient.patchDataModelTable(data.tableId, {
      description: data.description,
    });

    return json({ success: 'true', errors: [] });
  } catch (_error) {
    return json({ success: 'false', errors: [] });
  }
}

export function EditTable({ table, children }: { table: TableModel; children: React.ReactNode }) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const form = useForm({
    defaultValues: {
      description: table.description,
      tableId: table.id,
    } as EditTableForm,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/data/editTable'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChangeAsync: editTableFormSchema,
      onBlurAsync: editTableFormSchema,
      onSubmitAsync: editTableFormSchema,
    },
  });

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Modal.Title>{t('data:edit_table.title')}</Modal.Title>
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-1 flex-col gap-4">
              <form.Field name="description">
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <FormLabel name={field.name}>{t('data:description')}</FormLabel>
                    <FormInput
                      type="text"
                      name={field.name}
                      defaultValue={field.state.value as string}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      valid={field.state.meta.errors.length === 0}
                      placeholder={t('data:create_table.description_placeholder')}
                    />
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
            </div>
            <div className="flex flex-1 flex-row gap-2">
              <Modal.Close asChild>
                <Button className="flex-1" variant="secondary">
                  {t('common:cancel')}
                </Button>
              </Modal.Close>
              <Button className="flex-1" variant="primary" type="submit" name="edit">
                {t('data:edit_table.button_accept')}
              </Button>
            </div>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
