import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type DataModelField, EnumDataTypes } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, HiddenInputs, Input, Modal } from 'ui-design-system';
import { z } from 'zod';

export const handle = {
  i18n: ['data', 'navigation', 'common'] satisfies Namespace,
};

const editFieldFormSchema = z.object({
  description: z.string(),
  fieldId: z.string().uuid(),
  isEnum: z.boolean(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const parsedData = editFieldFormSchema.safeParse(await request.json());

  if (!parsedData.success) {
    parsedData.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: null,
      error: parsedData.error.format(),
    });
  }
  const { description, fieldId, isEnum } = parsedData.data;

  try {
    await apiClient.patchDataModelField(fieldId, {
      description,
      is_enum: isEnum,
    });
    return json({
      success: true as const,
      values: parsedData.data,
      error: null,
    });
  } catch (error) {
    const { getSession, commitSession } = serverServices.toastSessionService;
    const session = await getSession(request);
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });
    Sentry.captureException(error);
    return json(
      {
        success: false as const,
        values: parsedData.data,
        error,
      },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}

export function EditField({
  field: inputField,
  children,
}: {
  field: DataModelField;
  children: React.ReactNode;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const formMethods = useForm<z.infer<typeof editFieldFormSchema>>({
    progressive: true,
    resolver: zodResolver(editFieldFormSchema),
    defaultValues: {
      description: inputField.description,
      fieldId: inputField.id,
      isEnum: inputField.isEnum,
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
          onSubmit={({ formDataJson }) => {
            fetcher.submit(formDataJson, {
              method: 'POST',
              action: getRoute('/ressources/data/editField'),
              encType: 'application/json',
            });
          }}
        >
          <FormProvider {...formMethods}>
            <HiddenInputs fieldId={'dummy value'} />
            <Modal.Title>{t('data:edit_field.title')}</Modal.Title>
            <div className="flex flex-col gap-6 p-6">
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
                            'data:create_field.description_placeholder',
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormError />
                    </FormItem>
                  )}
                />
              </div>
              {EnumDataTypes.includes(inputField.dataType) ? (
                <FormField
                  name="isEnum"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                          }}
                        />
                      </FormControl>
                      <FormLabel>
                        <p>{t('data:create_field.is_enum.title')}</p>
                        <p className="text-xs">
                          {t('data:create_field.is_enum.subtitle')}
                        </p>
                      </FormLabel>
                      <FormError />
                    </FormItem>
                  )}
                />
              ) : null}
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
