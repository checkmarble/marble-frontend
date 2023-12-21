import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { type TableModel } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, HiddenInputs, Input, Modal } from 'ui-design-system';
import { z } from 'zod';

export const handle = {
  i18n: ['data', 'navigation', 'common'] satisfies Namespace,
};

const editTableFormSchema = z.object({
  description: z.string(),
  tableId: z.string().uuid(),
});

export async function action({ request }: ActionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const parsedForm = await parseFormSafe(request, editTableFormSchema);
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: parsedForm.formData,
      error: parsedForm.error.format(),
    });
  }
  const { description, tableId } = parsedForm.data;

  try {
    await apiClient.patchDataModelTable(tableId, {
      description,
    });
    return json({
      success: true as const,
      values: parsedForm.data,
      error: null,
    });
  } catch (error) {
    return json({
      success: false as const,
      values: parsedForm.data,
      error: error,
    });
  }
}

export function EditTable({
  table,
  children,
}: {
  table: TableModel;
  children: React.ReactNode;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const formMethods = useForm<z.infer<typeof editTableFormSchema>>({
    progressive: true,
    resolver: zodResolver(editTableFormSchema),
    defaultValues: {
      description: table.description,
      tableId: table.id,
    },
  });
  const { control, register, setValue } = formMethods;
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      setIsOpen(false);
      setValue('description', fetcher.data?.values.description);
    }
  }, [fetcher.data?.success, fetcher.data?.values, fetcher.state, setValue]);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <Form
          control={control}
          onSubmit={({ formData }) => {
            fetcher.submit(formData, {
              method: 'POST',
              action: '/ressources/data/editTable',
            });
          }}
        >
          <FormProvider {...formMethods}>
            <HiddenInputs tableId={'dummy value'} />
            <Modal.Title>{t('data:edit_table.title')}</Modal.Title>
            <div className="flex flex-col gap-6 p-6">
              <div className="flex flex-1 flex-col gap-4">
                <input hidden {...register('tableId')} />
                <FormField
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>{t('data:description')}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t(
                            'data:create_table.description_placeholder',
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormError />
                    </FormItem>
                  )}
                />
              </div>
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
                  name="edit"
                >
                  {t('data:edit_table.button_accept')}
                </Button>
              </div>
            </div>
          </FormProvider>
        </Form>
      </Modal.Content>
    </Modal.Root>
  );
}
