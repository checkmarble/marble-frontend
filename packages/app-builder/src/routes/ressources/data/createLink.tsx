import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models';
import { type TableModel } from '@app-builder/models/data-model';
import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useEffect, useMemo, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal, Select } from 'ui-design-system';
import { Plus } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['data', 'navigation', 'common'] satisfies Namespace,
};

const createLinkFormSchema = z.object({
  name: z
    .string()
    .nonempty()
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Only alphanumeric and _',
    }),
  parentTableId: z.string().nonempty().uuid(),
  parentFieldId: z.string().nonempty().uuid(),
  childTableId: z.string().nonempty().uuid(),
  childFieldId: z.string().nonempty().uuid(),
});

export async function action({ request }: ActionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const parsedForm = await parseFormSafe(request, createLinkFormSchema);
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: parsedForm.formData,
      error: parsedForm.error.format(),
    });
  }
  const { name, parentFieldId, childFieldId, parentTableId, childTableId } =
    parsedForm.data;

  try {
    await apiClient.postDataModelTableLink({
      name,
      parent_field_id: parentFieldId,
      child_field_id: childFieldId,
      parent_table_id: parentTableId,
      child_table_id: childTableId,
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
        messageKey: 'common:errors.data.duplicate_link_name',
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

export function CreateLink({
  thisTable,
  otherTables,
}: {
  otherTables: TableModel[];
  thisTable: TableModel;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();
  const [selectedParentTable, setSelectedParentTable] = useState(
    otherTables[0],
  );
  const selectedParentTableFields = useMemo(() => {
    return selectedParentTable.fields;
  }, [selectedParentTable]);

  const formMethods = useForm<z.infer<typeof createLinkFormSchema>>({
    progressive: true,
    resolver: zodResolver(createLinkFormSchema),
    defaultValues: {
      name: '',
      parentTableId: otherTables[0].id,
      parentFieldId: selectedParentTableFields[0].id,
      childTableId: thisTable.id,
      childFieldId: thisTable.fields[0].id,
    },
  });
  const { control, reset, setValue } = formMethods;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      setIsOpen(false);
      reset();
    }
  }, [fetcher.data?.success, fetcher.state, reset]);
  useEffect(() => {
    setValue('parentFieldId', selectedParentTableFields[0].id);
  }, [setValue, selectedParentTableFields]);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>
        <Button className="w-48" variant="secondary">
          <Plus width={'24px'} height={'24px'} />
          {t('data:create_link.title')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Form
          control={control}
          onSubmit={({ formData }) => {
            fetcher.submit(formData, {
              method: 'POST',
              action: '/ressources/data/createLink',
            });
          }}
        >
          <FormProvider {...formMethods}>
            <Modal.Title>{t('data:create_link.title')}</Modal.Title>
            <div className="bg-grey-00 flex flex-col gap-8 p-8">
              <div className="flex flex-1 flex-col gap-4">
                <FormField
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>{t('data:link_name')}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t('data:create_link.name_placeholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormError />
                    </FormItem>
                  )}
                />

                <div className="flex flex-row justify-around gap-2">
                  <FormField
                    name="childTableId"
                    control={control}
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col gap-2">
                        <FormLabel>
                          {t('data:create_link.child_table')}
                        </FormLabel>
                        <FormControl>
                          <Select.Default
                            disabled={true}
                            onValueChange={(type) => {
                              field.onChange(type);
                            }}
                            value={field.value}
                          >
                            {[thisTable].map(({ id, name }) => {
                              return (
                                <Select.DefaultItem key={id} value={id}>
                                  {name}
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
                    name="childFieldId"
                    control={control}
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col gap-2">
                        <FormLabel>
                          {t('data:create_link.child_field')}
                        </FormLabel>
                        <FormControl>
                          <Select.Default
                            onValueChange={(type) => {
                              field.onChange(type);
                            }}
                            value={field.value}
                          >
                            {thisTable.fields.map(({ id, name }) => {
                              return (
                                <Select.DefaultItem key={id} value={id}>
                                  {name}
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
                <div className="flex flex-row justify-around gap-2">
                  <FormField
                    name="parentTableId"
                    control={control}
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col gap-2">
                        <FormLabel>
                          {t('data:create_link.parent_table')}
                        </FormLabel>
                        <FormControl>
                          <Select.Default
                            onValueChange={(id) => {
                              field.onChange(id);
                              const newTable =
                                otherTables.find(
                                  ({ id: tableId }) => tableId === id,
                                ) ?? otherTables[0];
                              setSelectedParentTable(newTable);
                            }}
                            value={field.value}
                          >
                            {otherTables.map(({ id, name }) => {
                              return (
                                <Select.DefaultItem key={id} value={id}>
                                  {name}
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
                    name="parentFieldId"
                    control={control}
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col gap-2">
                        <FormLabel>
                          {t('data:create_link.parent_field')}
                        </FormLabel>
                        <FormControl>
                          <Select.Default
                            defaultValue={selectedParentTableFields[0].id}
                            onValueChange={(type) => {
                              field.onChange(type);
                            }}
                            value={field.value}
                          >
                            {selectedParentTableFields.map(({ id, name }) => {
                              return (
                                <Select.DefaultItem key={id} value={id}>
                                  {name}
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
