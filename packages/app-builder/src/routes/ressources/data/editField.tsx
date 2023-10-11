import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { Button, HiddenInputs, Input, Modal } from '@ui-design-system';
import { type Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const handle = {
  i18n: ['data', 'navigation', 'common'] satisfies Namespace,
};

const editFieldFormSchema = z.object({
  description: z.string(),
  fieldId: z.string().uuid(),
});

export async function action({ request }: ActionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const parsedForm = await parseFormSafe(request, editFieldFormSchema);
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: parsedForm.formData,
      error: parsedForm.error.format(),
    });
  }
  const { description, fieldId } = parsedForm.data;

  try {
    await apiClient.patchDataModelField(fieldId, {
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

export function EditField({
  fieldId,
  description,
  children,
}: {
  fieldId: string;
  description: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const formMethods = useForm<z.infer<typeof editFieldFormSchema>>({
    progressive: true,
    resolver: zodResolver(editFieldFormSchema),
    defaultValues: {
      description,
      fieldId,
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
              action: '/ressources/data/editField',
            });
          }}
        >
          <FormProvider {...formMethods}>
            <HiddenInputs fieldId={'dummy value'} />
            <Modal.Title>{t('data:edit_field.title')}</Modal.Title>
            <div className="bg-grey-00 flex flex-col gap-8 p-8">
              <div className="flex flex-1 flex-col gap-4">
                <input hidden {...register('fieldId')} />
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
                            'data:create_field.description_placeholder'
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
                  {t('data:edit_field.button_accept')}
                </Button>
              </div>
            </div>
          </FormProvider>
        </Form>
      </Modal.Content>
    </Modal.Root>
  );
}
