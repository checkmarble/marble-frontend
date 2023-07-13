import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app-builder/components/Form';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/repositories';
import { authenticator } from '@app-builder/services/auth/auth.server';
import {
  commitSession,
  getSession,
} from '@app-builder/services/auth/session.server';
import { getRoute } from '@app-builder/services/routes';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionArgs, json, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { Button, Input, Modal } from '@ui-design-system';
import { Plus } from '@ui-icons';
import { type Namespace } from 'i18next';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const handle = {
  i18n: ['lists', 'navigation', 'common'] satisfies Namespace,
};

const createListFormSchema = z.object({
  name: z.string().nonempty(),
  description: z.string(),
});

export async function action({ request }: ActionArgs) {
  const { apiClient } = await authenticator.isAuthenticated(request, {
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
      getRoute('/lists/:listId', { listId: fromUUID(result.custom_list.id) })
    );
  } catch (error) {
    if (isStatusConflictHttpError(error)) {
      const session = await getSession(request.headers.get('cookie'));
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
        { headers: { 'Set-Cookie': await commitSession(session) } }
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
          <Plus width={'24px'} height={'24px'} />
          {t('lists:create_list.title')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Form
          control={control}
          onSubmit={({ formData }) => {
            fetcher.submit(formData, {
              method: 'POST',
              action: '/ressources/lists/create',
            });
          }}
        >
          <FormProvider {...formMethods}>
            <Modal.Title>{t('lists:create_list.title')}</Modal.Title>
            <div className="bg-grey-00 flex flex-col gap-8 p-8">
              <div className="flex flex-1 flex-col gap-4">
                <FormField
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>{t('lists:name')}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t('lists:create_list.name_placeholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>{t('lists:description')}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t(
                            'lists:create_list.description_placeholder'
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
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
