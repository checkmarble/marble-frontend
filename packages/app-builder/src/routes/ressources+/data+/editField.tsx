import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  type DataModelField,
  EnumDataTypes,
  type LinkToSingle,
  UniqueDataTypes,
} from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { captureUnexpectedRemixError } from '@app-builder/services/monitoring';
import { getRoute } from '@app-builder/utils/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useEffect, useMemo, useState } from 'react';
import { Form, FormProvider, useForm, useWatch } from 'react-hook-form';
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
  isUnique: z.boolean(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { dataModelRepository } = await authService.isAuthenticated(request, {
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
  const { description, fieldId, isEnum, isUnique } = parsedData.data;

  try {
    await dataModelRepository.patchDataModelField(fieldId, {
      description,
      isEnum,
      isUnique,
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
    captureUnexpectedRemixError(error, 'editField@action', request);
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

function disableEditUnique({
  field,
  linksToThisTable,
  selectedEnum,
}: {
  field: DataModelField;
  linksToThisTable: LinkToSingle[];
  selectedEnum: boolean;
}) {
  if (
    field.unicityConstraint !== 'no_unicity_constraint' &&
    field.name === 'object_id'
  ) {
    return {
      disabled: true,
      reason: 'object_id_must_be_unique',
    };
  }
  if (selectedEnum) {
    return {
      disabled: true,
      reason: 'cannot_toggle_enum_enabled',
    };
  }
  if (field.unicityConstraint === 'pending_unique_constraint') {
    return {
      disabled: true,
      reason: 'cannot_toggle_index_pending',
    };
  }
  const linksToThisField = linksToThisTable.filter(
    (link) => link.parentFieldName === field.name,
  );
  if (
    field.unicityConstraint !== 'no_unicity_constraint' &&
    linksToThisField.length > 0
  ) {
    return {
      disabled: true,
      reason: 'cannot_untoggle_field_linked',
    };
  }

  return {
    disabled: false,
    reason: null,
  };
}

export function EditField({
  field: inputField,
  linksToThisTable,
  children,
}: {
  field: DataModelField;
  linksToThisTable: LinkToSingle[];
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
      isUnique: inputField.unicityConstraint !== 'no_unicity_constraint',
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
  const selectedEnum = useWatch({ control, name: 'isEnum' });
  const selectedUnique = useWatch({ control, name: 'isUnique' });
  const uniqueSettingDisabled = useMemo(
    () =>
      disableEditUnique({
        field: inputField,
        linksToThisTable,
        selectedEnum,
      }),
    [inputField, linksToThisTable, selectedEnum],
  );

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
              {UniqueDataTypes.includes(inputField.dataType) ? (
                <FormField
                  name="isUnique"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          disabled={uniqueSettingDisabled.disabled}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                          }}
                        />
                      </FormControl>
                      <FormLabel>
                        <p>{t('data:edit_field.is_unique.title')}</p>
                        {inputField.unicityConstraint ===
                        'no_unicity_constraint' ? (
                          <p className="text-xs">
                            {t('data:edit_field.is_unique.toggle')}
                          </p>
                        ) : null}
                        {uniqueSettingDisabled.reason ===
                        'cannot_toggle_index_pending' ? (
                          <p className="text-xs text-red-50">
                            {t(
                              'data:edit_field.is_unique.cannot_toggle_index_pending',
                            )}
                          </p>
                        ) : null}
                        {uniqueSettingDisabled.reason ===
                        'cannot_untoggle_field_linked' ? (
                          <p className="text-xs text-red-50">
                            {t(
                              'data:edit_field.is_unique.cannot_untoggle_field_linked',
                            )}
                          </p>
                        ) : null}
                        {field.value &&
                        inputField.unicityConstraint ===
                          'no_unicity_constraint' ? (
                          <p className="text-xs text-red-50">
                            {t(
                              'data:edit_field.is_unique.warning_creation_asynchronous',
                            )}
                          </p>
                        ) : null}
                        {inputField.unicityConstraint ===
                          'active_unique_constraint' && !field.value ? (
                          <p className="text-xs text-red-50">
                            {t('data:edit_field.is_unique.warning_untoggle')}
                          </p>
                        ) : null}
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
