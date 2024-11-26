import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  EnumDataTypes,
  isStatusConflictHttpError,
  UniqueDataTypes,
} from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { captureUnexpectedRemixError } from '@app-builder/services/monitoring';
import { getRoute } from '@app-builder/utils/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
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
import { z } from 'zod';

export const handle = {
  i18n: ['data', 'navigation', 'common'] satisfies Namespace,
};

const createFieldFormSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-z]+[a-z0-9_]+$/, {
      message: 'Only lower case alphanumeric and _, must start with a letter',
    })
    .refine((value) => value !== 'id', {
      message: 'The name "id" is reserved',
    }),
  description: z.string(),
  required: z.string(),
  type: z.enum(['String', 'Bool', 'Timestamp', 'Float', 'Int']),
  tableId: z.string(),
  isEnum: z.boolean(),
  isUnique: z.boolean(),
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

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
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
  const { name, description, type, required, tableId, isEnum, isUnique } =
    parsedData.data;

  try {
    await dataModelRepository.postDataModelTableField(tableId, {
      name: name,
      description: description,
      type,
      nullable: required === 'optional',
      isEnum,
      isUnique,
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
      captureUnexpectedRemixError(error, 'createField@action', request);
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

export function CreateField({
  tableId,
  children,
}: {
  tableId: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <CreateFieldContent
          tableId={tableId}
          closeModal={() => {
            setIsOpen(false);
          }}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

function CreateFieldContent({
  tableId,
  closeModal,
}: {
  tableId: string;
  closeModal: () => void;
}) {
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
      isUnique: false,
    },
  });
  const { control, register } = formMethods;

  const selectedType = useWatch({ control, name: 'type' });
  const selectedEnum = useWatch({ control, name: 'isEnum' });
  const selectedUnique = useWatch({ control, name: 'isUnique' });

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      closeModal();
    }
  }, [closeModal, fetcher.data?.success, fetcher.state]);

  return (
    <Form
      control={control}
      onSubmit={({ formDataJson }) => {
        fetcher.submit(formDataJson, {
          method: 'POST',
          action: getRoute('/ressources/data/createField'),
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
                        disabled={selectedUnique}
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
            {UniqueDataTypes.includes(selectedType) ? (
              <FormField
                name="isUnique"
                control={control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        disabled={selectedEnum}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                        }}
                      />
                    </FormControl>
                    <FormLabel>
                      <p>{t('data:edit_field.is_unique.title')}</p>
                      <p className="text-xs">
                        {t('data:edit_field.is_unique.toggle')}
                      </p>
                      {field.value ? (
                        <p className="text-xs text-red-100">
                          {t(
                            'data:edit_field.is_unique.warning_creation_asynchronous',
                          )}
                        </p>
                      ) : null}
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
  );
}
