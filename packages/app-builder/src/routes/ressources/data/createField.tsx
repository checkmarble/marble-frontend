import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { EnumDataTypes, isStatusConflictHttpError } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { Form, FormProvider, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Checkbox,
  HiddenInputs,
  Input,
  Modal,
  Select,
} from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['data', 'navigation', 'common'] satisfies Namespace,
};

const createFieldFormSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Only alphanumeric and _' }),
  description: z.string(),
  required: z.string(),
  type: z.enum(['String', 'Bool', 'Timestamp', 'Float', 'Int']),
  tableId: z.string(),
  isEnum: z.boolean(),
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

  const parsedData = createFieldFormSchema.safeParse(await request.json());

  if (!parsedData.success) {
    parsedData.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: null,
      error: parsedData.error.format(),
    });
  }
  const { name, description, type, required, tableId, isEnum } =
    parsedData.data;

  try {
    await apiClient.postDataModelTableField(tableId, {
      name: name,
      description: description,
      type,
      nullable: required === 'optional',
      is_enum: isEnum,
    });
    return json({
      success: true as const,
      values: null,
      error: null,
    });
  } catch (error) {
    if (isStatusConflictHttpError(error)) {
      const { getSession, commitSession } = serverServices.toastSessionService;
      const session = await getSession(request);
      setToastMessage(session, {
        type: 'error',
        messageKey: 'common:errors.data.duplicate_field_name',
      });
      return json(
        {
          success: false as const,
          values: parsedData.data,
          error: error,
        },
        { headers: { 'Set-Cookie': await commitSession(session) } },
      );
    } else {
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
      isEnum: false,
    },
  });
  const { control, register, reset } = formMethods;
  const selectedType = useWatch({ control, name: 'type' });
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
          <Icon icon="plus" className="h-6 w-6" />
          {t('data:create_field.title')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Form
          control={control}
          onSubmit={({ formDataJson }) => {
            fetcher.submit(formDataJson, {
              method: 'POST',
              action: '/ressources/data/createField',
              encType: 'application/json',
            });
          }}
        >
          <FormProvider {...formMethods}>
            <HiddenInputs tableId={'dummy value'} />
            <Modal.Title>{t('data:create_field.title')}</Modal.Title>
            <div className="flex flex-col gap-6 p-6">
              <div className="flex flex-1 flex-col gap-4">
                <input hidden {...register('tableId')} />
                <FormField
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>{t('data:field_name')}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t('data:create_field.name_placeholder')}
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
                <div className="flex flex-row justify-around gap-2">
                  <FormField
                    name="required"
                    control={control}
                    render={({ field }) => (
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
                        <FormError />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="type"
                    control={control}
                    render={({ field }) => (
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
                        <FormError />
                      </FormItem>
                    )}
                  />
                </div>
                {EnumDataTypes.includes(selectedType) ? (
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
