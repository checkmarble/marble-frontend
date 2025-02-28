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
import { getRoute } from '@app-builder/utils/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useEffect, useMemo, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal, Select } from 'ui-design-system';
import { z } from 'zod';

export const handle = {
  i18n: ['data', 'navigation', 'common'] satisfies Namespace,
};

const createLinkFormSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-z]+[a-z0-9_]+$/, {
      message: 'Only lower case alphanumeric and _, must start with a letter',
    }),
  parentTableId: z.string().min(1).uuid(),
  parentFieldId: z.string().min(1).uuid(),
  childTableId: z.string().min(1).uuid(),
  childFieldId: z.string().min(1).uuid(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
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
  const { name, parentFieldId, childFieldId, parentTableId, childTableId } = parsedForm.data;

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
  children,
}: {
  otherTables: [TableModel, ...TableModel[]];
  thisTable: TableModel;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <CreateLinkContent
          thisTable={thisTable}
          otherTables={otherTables}
          closeModal={() => {
            setIsOpen(false);
          }}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

function CreateLinkContent({
  thisTable,
  otherTables,
  closeModal,
}: {
  otherTables: [TableModel, ...TableModel[]];
  thisTable: TableModel;
  closeModal: () => void;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();
  const [selectedParentTable, setSelectedParentTable] = useState(otherTables[0]);
  const selectedParentTableFields = useMemo(() => {
    return selectedParentTable.fields.filter(
      (field) => field.unicityConstraint === 'active_unique_constraint',
    );
  }, [selectedParentTable]);

  const formMethods = useForm<z.infer<typeof createLinkFormSchema>>({
    progressive: true,
    resolver: zodResolver(createLinkFormSchema),
    defaultValues: {
      name: '',
      parentTableId: otherTables[0].id,
      parentFieldId: selectedParentTableFields[0]?.id,
      childTableId: thisTable.id,
      childFieldId: thisTable.fields[0]?.id,
    },
  });
  const { control, setValue } = formMethods;

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      closeModal();
    }
  }, [closeModal, fetcher.data?.success, fetcher.state]);
  useEffect(() => {
    const parentFieldId = selectedParentTableFields[0]?.id;
    if (!parentFieldId) return;
    setValue('parentFieldId', parentFieldId);
  }, [setValue, selectedParentTableFields]);

  return (
    <Form
      control={control}
      onSubmit={({ formData }) => {
        fetcher.submit(formData, {
          method: 'POST',
          action: getRoute('/ressources/data/createLink'),
        });
      }}
    >
      <FormProvider {...formMethods}>
        <Modal.Title>{t('data:create_link.title')}</Modal.Title>
        <div className="flex flex-col gap-6 p-6">
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
                    <FormLabel>{t('data:create_link.child_table')}</FormLabel>
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
                    <FormLabel>{t('data:create_link.child_field')}</FormLabel>
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
                    <FormLabel>{t('data:create_link.parent_table')}</FormLabel>
                    <FormControl>
                      <Select.Default
                        onValueChange={(id) => {
                          field.onChange(id);
                          const newTable =
                            otherTables.find(({ id: tableId }) => tableId === id) ?? otherTables[0];
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
                    <FormLabel>{t('data:create_link.parent_field')}</FormLabel>
                    <FormControl>
                      <Select.Default
                        defaultValue={selectedParentTableFields[0]?.id}
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
            <p>{t('data:create_link.must_point_to_unique_field')}</p>
          </div>
          <div className="flex flex-1 flex-row gap-2">
            <Modal.Close asChild>
              <Button className="flex-1" variant="secondary">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button className="flex-1" variant="primary" type="submit" name="create">
              {t('data:create_field.button_accept')}
            </Button>
          </div>
        </div>
      </FormProvider>
    </Form>
  );
}
