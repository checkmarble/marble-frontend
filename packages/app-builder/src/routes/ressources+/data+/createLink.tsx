import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models';
import { type TableModel } from '@app-builder/models/data-model';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Select } from 'ui-design-system';
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

type CreateLinkForm = z.infer<typeof createLinkFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, t, raw, { apiClient }] = await Promise.all([
    getSession(request),
    getFixedT(request, ['common', 'data']),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = createLinkFormSchema.safeParse(raw);

  if (!success) return json({ success: 'false', errors: error.flatten() });
  const { name, parentFieldId, childFieldId, parentTableId, childTableId } = data;

  try {
    await apiClient.postDataModelTableLink({
      name,
      parent_field_id: parentFieldId,
      child_field_id: childFieldId,
      parent_table_id: parentTableId,
      child_table_id: childTableId,
    });

    return json({ success: 'true', errors: [] });
  } catch (error) {
    if (isStatusConflictHttpError(error)) {
      setToastMessage(session, {
        type: 'error',
        message: t('common:errors.data.duplicate_link_name'),
      });
    }

    return json(
      { success: 'false', errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
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

  const form = useForm({
    defaultValues: {
      name: '',
      parentTableId: otherTables[0].id,
      parentFieldId: selectedParentTableFields[0]?.id as string,
      childTableId: thisTable.id,
      childFieldId: thisTable.fields[0]?.id as string,
    } as CreateLinkForm,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/data/createLink'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChange: createLinkFormSchema,
      onBlur: createLinkFormSchema,
      onSubmit: createLinkFormSchema,
    },
  });

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      closeModal();
    }
  }, [closeModal, fetcher.data?.success, fetcher.state]);

  useEffect(() => {
    const parentFieldId = selectedParentTableFields[0]?.id;
    if (!parentFieldId) return;
    form.setFieldValue('parentFieldId', parentFieldId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedParentTableFields]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Modal.Title>{t('data:create_link.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-1 flex-col gap-4">
          <form.Field name="name">
            {(field) => (
              <div className="flex flex-col gap-2">
                <FormLabel name={field.name}>{t('data:link_name')}</FormLabel>
                <FormInput
                  type="text"
                  name={field.name}
                  defaultValue={field.state.value as string}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  onBlur={field.handleBlur}
                  valid={field.state.meta.errors.length === 0}
                  placeholder={t('data:create_link.name_placeholder')}
                />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>

          <div className="flex flex-row justify-around gap-2">
            <form.Field name="childTableId">
              {(field) => (
                <div className="flex flex-1 flex-col gap-2">
                  <FormLabel name={field.name}>{t('data:create_link.child_table')}</FormLabel>
                  <Select.Default
                    disabled={true}
                    defaultValue={field.state.value}
                    onValueChange={(type) => {
                      field.handleChange(type);
                    }}
                  >
                    {[thisTable].map(({ id, name }) => {
                      return (
                        <Select.DefaultItem key={id} value={id}>
                          {name}
                        </Select.DefaultItem>
                      );
                    })}
                  </Select.Default>
                  v
                </div>
              )}
            </form.Field>
            <form.Field name="childFieldId">
              {(field) => (
                <div className="flex flex-1 flex-col gap-2">
                  <FormLabel name={field.name}>{t('data:create_link.child_field')}</FormLabel>
                  <Select.Default
                    defaultValue={field.state.value}
                    onValueChange={(type) => {
                      field.handleChange(type);
                    }}
                  >
                    {thisTable.fields.map(({ id, name }) => {
                      return (
                        <Select.DefaultItem key={id} value={id}>
                          {name}
                        </Select.DefaultItem>
                      );
                    })}
                  </Select.Default>
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
          </div>
          <div className="flex flex-row justify-around gap-2">
            <form.Field name="parentTableId">
              {(field) => (
                <div className="flex flex-1 flex-col gap-2">
                  <FormLabel name={field.name}>{t('data:create_link.parent_table')}</FormLabel>
                  <Select.Default
                    defaultValue={field.state.value}
                    onValueChange={(id) => {
                      field.handleChange(id);
                      const newTable =
                        otherTables.find(({ id: tableId }) => tableId === id) ?? otherTables[0];
                      setSelectedParentTable(newTable);
                    }}
                  >
                    {otherTables.map(({ id, name }) => {
                      return (
                        <Select.DefaultItem key={id} value={id}>
                          {name}
                        </Select.DefaultItem>
                      );
                    })}
                  </Select.Default>
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
            <form.Field name="parentFieldId">
              {(field) => (
                <div className="flex flex-1 flex-col gap-2">
                  <FormLabel name={field.name}>{t('data:create_link.parent_field')}</FormLabel>
                  <Select.Default
                    defaultValue={selectedParentTableFields[0]?.id}
                    onValueChange={field.handleChange}
                  >
                    {selectedParentTableFields.map(({ id, name }) => {
                      return (
                        <Select.DefaultItem key={id} value={id}>
                          {name}
                        </Select.DefaultItem>
                      );
                    })}
                  </Select.Default>
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
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
    </form>
  );
}
