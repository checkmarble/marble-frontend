import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app-builder/components/Form';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { Button, HiddenInputs, Input, Modal, Select } from '@ui-design-system';
import { Plus } from '@ui-icons';
import { type Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const handle = {
  i18n: ['data', 'navigation', 'common'] satisfies Namespace,
};

const createFieldFormSchema = z.object({
  name: z
    .string()
    .nonempty()
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Only alphanumeric and _' }),
  description: z.string(),
  required: z.string(),
  type: z.enum(['String', 'Bool', 'Timestamp', 'Float', 'Int']),
  tableId: z.string(),
});

const VALUE_TYPES = [
  { value: 'String', display: 'data:create_field.type_string' },
  { value: 'Bool', display: 'data:create_field.type_bool' },
  { value: 'Timestamp', display: 'data:create_field.type_timestamp' },
  { value: 'Float', display: 'data:create_field.type_float' },
] as const;
const REQUIRED_OPTIONS = [
  { value: 'optional', display: 'data:create_field.option_optional' },
  { value: 'required', display: 'data:create_field.option_required' },
] as const;

export async function action({ request }: ActionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const parsedForm = await parseFormSafe(request, createFieldFormSchema);
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: parsedForm.formData,
      error: parsedForm.error.format(),
    });
  }
  const { name, description, type, required, tableId } = parsedForm.data;

  try {
    await apiClient.postDataModelTableField(tableId, {
      name: name,
      description: description,
      type,
      nullable: required === 'optional',
    });
    return json({
      success: true as const,
      values: null,
      error: null,
    });
  } catch (error) {
    if (isStatusConflictHttpError(error)) {
      const { getSession, commitSession } = serverServices.sessionService;
      const session = await getSession(request);
      setToastMessage(session, {
        type: 'error',
        messageKey: 'common:errors.data.duplicate_field_name',
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

export function CreateField({ tableId }: { tableId: string }) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const formMethods = useForm<z.infer<typeof createFieldFormSchema>>({
    progressive: true,
    resolver: zodResolver(createFieldFormSchema),
    defaultValues: {
      required: REQUIRED_OPTIONS[0].value,
      name: '',
      description: '',
      type: VALUE_TYPES[0].value,
      tableId: tableId,
    },
  });
  const { control, register, reset } = formMethods;
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      setIsOpen(false);
      reset();
    }
  }, [fetcher.data?.success, fetcher.state, reset]);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>
        <Button>
          <Plus width={'24px'} height={'24px'} />
          {t('data:create_field.title')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Form
          control={control}
          onSubmit={({ formData }) => {
            fetcher.submit(formData, {
              method: 'POST',
              action: '/ressources/data/createField',
            });
          }}
        >
          <FormProvider {...formMethods}>
            <HiddenInputs tableId={'dummy value'} />
            <Modal.Title>{t('data:create_field.title')}</Modal.Title>
            <div className="bg-grey-00 flex flex-col gap-8 p-8">
              <div className="flex flex-1 flex-col gap-4">
                <input hidden {...register('tableId')} />
                <FormField
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>{t('data:field_name')}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t('data:create_field.name_placeholder')}
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
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )}
                />
                <div className="flex flex-row justify-around gap-2">
                  <FormField
                    name="required"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormItem className="flex flex-1 flex-col gap-2">
                        <FormLabel>{t('data:create_field.required')}</FormLabel>
                        <FormControl>
                          <Select.Default
                            className="w-full overflow-hidden"
                            onValueChange={(type) => {
                              field.onChange(type);
                            }}
                            value={field.value}
                          >
                            {REQUIRED_OPTIONS.map(({ value, display }) => {
                              return (
                                <Select.DefaultItem key={value} value={value}>
                                  {t(display)}
                                </Select.DefaultItem>
                              );
                            })}
                          </Select.Default>
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="type"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormItem className="flex flex-1 flex-col gap-2">
                        <FormLabel>{t('data:create_field.type')}</FormLabel>
                        <FormControl>
                          <Select.Default
                            className="w-full"
                            onValueChange={(type) => {
                              field.onChange(type);
                            }}
                            value={field.value}
                          >
                            {VALUE_TYPES.map(({ value, display }) => {
                              return (
                                <Select.DefaultItem key={value} value={value}>
                                  {t(display)}
                                </Select.DefaultItem>
                              );
                            })}
                          </Select.Default>
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
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
                  {t('data:create_field.button_accept')}
                </Button>
              </div>
            </div>
          </FormProvider>
        </Form>
      </Modal.Content>
    </Modal.Root>
  );
}
