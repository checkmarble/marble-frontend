import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['lists', 'navigation', 'common'] satisfies Namespace,
};

const addValueFormSchema = z.object({
  listId: z.string().uuid(),
  value: z.string().nonempty(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { customListsRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const parsedForm = await parseFormSafe(request, addValueFormSchema);
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: parsedForm.formData,
      error: parsedForm.error.format(),
    });
  }
  const { listId, value } = parsedForm.data;
  await customListsRepository.createCustomListValue(listId, {
    value: value,
  });
  return json({
    success: true as const,
    values: parsedForm.data,
    error: null,
  });
}

export function NewListValue({ listId }: { listId: string }) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const formMethods = useForm<z.infer<typeof addValueFormSchema>>({
    progressive: true,
    resolver: zodResolver(addValueFormSchema),
    defaultValues: {
      listId,
      value: '',
    },
  });
  const { control, register } = formMethods;

  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      setIsOpen(false);
      formMethods.reset();
    }
  }, [fetcher.data?.success, fetcher.state, formMethods]);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>
        <Button>
          <Icon icon="plus" className="size-6" />
          {t('lists:create_value.title')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Form
          control={control}
          onSubmit={({ formData }) => {
            fetcher.submit(formData, {
              method: 'POST',
              action: getRoute('/ressources/lists/value_create'),
            });
          }}
        >
          <FormProvider {...formMethods}>
            <input hidden {...register('listId')} />
            <Modal.Title>{t('lists:create_value.title')}</Modal.Title>
            <div className="flex flex-col gap-6 p-6">
              <FormField
                name="value"
                control={control}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>{t('lists:value', { count: 1 })}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder={t('lists:create_value.value_placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormError />
                  </FormItem>
                )}
              />
              <div className="flex flex-1 flex-row gap-2">
                <Modal.Close asChild>
                  <Button className="flex-1" variant="secondary">
                    {t('common:cancel')}
                  </Button>
                </Modal.Close>
                <Button className="flex-1" variant="primary" type="submit" name="create">
                  {t('common:save')}
                </Button>
              </div>
            </div>
          </FormProvider>
        </Form>
      </Modal.Content>
    </Modal.Root>
  );
}
