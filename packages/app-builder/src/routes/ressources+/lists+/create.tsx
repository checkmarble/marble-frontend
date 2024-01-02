import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['lists', 'navigation', 'common'] satisfies Namespace,
};

const createListFormSchema = z.object({
  name: z.string().nonempty(),
  description: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const parsedForm = await parseFormSafe(request, createListFormSchema);
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: parsedForm.formData,
      error: parsedForm.error.format(),
    });
  }
  const { name, description } = parsedForm.data;

  try {
    const result = await apiClient.createCustomList({
      name: name,
      description: description,
    });

    return redirect(
      getRoute('/lists/:listId', { listId: fromUUID(result.custom_list.id) }),
    );
  } catch (error) {
    if (isStatusConflictHttpError(error)) {
      const { getSession, commitSession } = serverServices.toastSessionService;
      const session = await getSession(request);
      setToastMessage(session, {
        type: 'error',
        messageKey: 'common:errors.list.duplicate_list_name',
      });
      return json(
        {
          success: false as const,
          values: parsedForm.data,
          error: error,
        },
        { headers: { 'Set-Cookie': await commitSession(session) } },
      );
    } else {
      return json({
        success: false as const,
        values: parsedForm.data,
        error: error,
      });
    }
  }
}

export function CreateList() {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const formMethods = useForm<z.infer<typeof createListFormSchema>>({
    progressive: true,
    resolver: zodResolver(createListFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });
  const { control } = formMethods;

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button>
          <Icon icon="plus" className="h-6 w-6" />
          {t('lists:create_list.title')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Form
          control={control}
          onSubmit={({ formData }) => {
            fetcher.submit(formData, {
              method: 'POST',
              action: getRoute('/ressources/lists/create'),
            });
          }}
        >
          <FormProvider {...formMethods}>
            <Modal.Title>{t('lists:create_list.title')}</Modal.Title>
            <div className="flex flex-col gap-6 p-6">
              <div className="flex flex-1 flex-col gap-4">
                <FormField
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>{t('lists:name')}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t('lists:create_list.name_placeholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormError />
                    </FormItem>
                  )}
                />
                <FormField
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>{t('lists:description')}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t(
                            'lists:create_list.description_placeholder',
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
                  name="create"
                >
                  {t('lists:create_list.button_accept')}
                </Button>
              </div>
            </div>
          </FormProvider>
        </Form>
      </Modal.Content>
    </Modal.Root>
  );
}
