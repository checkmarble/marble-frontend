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

const allowedLinkFieldTypes = ['Int', 'Float', 'String'];

const createLinkFormSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-z]+[a-z0-9_]*$/, {
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
      <Modal.Content
        /* Prevent auto-focus when the modal opens */
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
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

  // Filter fields with allowed types
  const allowedChildFields = useMemo(() => {
    return thisTable.fields.filter((field) => allowedLinkFieldTypes.includes(field.dataType));
  }, [thisTable.fields]);

  // Add state for tracking selected parent table
  const [selectedParentTableId, setSelectedParentTableId] = useState(otherTables[0].id);
  // Add state for tracking selected child field
  const [selectedChildFieldId, setSelectedChildFieldId] = useState(allowedChildFields[0]?.id || '');

  // Helper function to render field display with type
  const renderFieldDisplay = (name: string, dataType: string) => {
    return (
      <>
        {name}
        {dataType === 'Float' || dataType === 'Int'
          ? ' (' + t('data:create_field.type_float') + ')'
          : null}
      </>
    );
  };

  const extendedSchema = createLinkFormSchema.superRefine(
    ({ name, childFieldId, parentFieldId }, ctx) => {
      // Compare with existing link names on thisTable
      if (thisTable.linksToSingle?.some((link) => link.name.toLowerCase() === name.toLowerCase())) {
        ctx.addIssue({
          code: 'custom',
          path: ['name'],
          message: 'This link name already exists in this table.',
        });
      }

      // Validate that parent and child fields have the same data type
      const childField = thisTable.fields.find((field) => field.id === childFieldId);
      const parentTable = otherTables.find((table) => table.id === selectedParentTableId);
      const parentField = parentTable?.fields.find((field) => field.id === parentFieldId);

      if (childField && parentField && childField.dataType !== parentField.dataType) {
        ctx.addIssue({
          code: 'custom',
          path: ['parentFieldId'],
          message: `Parent field type (${parentField.dataType}) must match child field type (${childField.dataType})`,
        });
      }
    },
  );

  // Get current selected table
  const selectedParentTable = useMemo(() => {
    return otherTables.find(({ id }) => id === selectedParentTableId) ?? otherTables[0];
  }, [otherTables, selectedParentTableId]);

  // Get current selected child field
  const selectedChildField = useMemo(() => {
    return thisTable.fields.find(({ id }) => id === selectedChildFieldId);
  }, [thisTable.fields, selectedChildFieldId]);

  // Get parent fields with allowed types and unique constraint
  const selectedParentTableFields = useMemo(() => {
    if (!selectedChildField) return [];

    return selectedParentTable.fields.filter(
      (field) =>
        field.unicityConstraint === 'active_unique_constraint' &&
        field.dataType === selectedChildField.dataType,
    );
  }, [selectedParentTable, selectedChildField]);

  // Default parent field ID based on selected table
  const defaultParentFieldId = useMemo(() => {
    if (!selectedChildField) return '';

    // Find a field with matching type AND unique constraint
    const matchingField = selectedParentTable.fields.find(
      (field) =>
        field.unicityConstraint === 'active_unique_constraint' &&
        field.dataType === selectedChildField.dataType &&
        allowedLinkFieldTypes.includes(field.dataType),
    );

    return matchingField?.id || '';
  }, [selectedParentTable, selectedChildField]);

  // Check if we have any valid parent fields
  const hasValidParentFields = useMemo(() => {
    return selectedParentTableFields.length > 0;
  }, [selectedParentTableFields]);

  const form = useForm({
    defaultValues: {
      name: selectedParentTable.name,
      parentTableId: selectedParentTable.id,
      parentFieldId: defaultParentFieldId,
      childTableId: thisTable.id,
      childFieldId: allowedChildFields[0]?.id || '',
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
      onChange: extendedSchema,
      onBlur: extendedSchema,
      onSubmit: extendedSchema,
    },
  });

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      closeModal();
    }
  }, [closeModal, fetcher.data?.success, fetcher.state]);

  // Effect to update form values when selectedParentTableId changes
  useEffect(() => {
    // Since we can't directly clear errors with the public API, completely reset the form with updated default values
    form.reset({
      name: selectedParentTable.name,
      parentTableId: selectedParentTableId,
      parentFieldId: defaultParentFieldId,
      childTableId: thisTable.id,
      childFieldId: form.getFieldValue('childFieldId') || allowedChildFields[0]?.id || '',
    });
  }, [
    form,
    selectedParentTableId,
    defaultParentFieldId,
    selectedParentTable.name,
    thisTable.id,
    allowedChildFields,
  ]);

  // Update effect for child field ID changes
  useEffect(() => {
    if (!selectedChildField) return;

    // Find a matching parent field with the same data type
    const matchingParentField = selectedParentTable.fields.find(
      (field) =>
        field.unicityConstraint === 'active_unique_constraint' &&
        field.dataType === selectedChildField.dataType &&
        allowedLinkFieldTypes.includes(field.dataType),
    );

    // Reset the form with the new child field and matching parent field if available
    form.reset({
      ...form.state.values,
      childFieldId: selectedChildFieldId,
      parentFieldId: matchingParentField?.id || '',
    });
  }, [form, selectedChildFieldId, selectedParentTable.fields, selectedChildField]);

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
                  value={field.state.value as string}
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
                </div>
              )}
            </form.Field>
            <form.Field name="childFieldId">
              {(field) => (
                <div className="flex flex-1 flex-col gap-2">
                  <FormLabel name={field.name}>{t('data:create_link.child_field')}</FormLabel>
                  <Select.Default
                    value={field.state.value}
                    onValueChange={(id) => {
                      // Set the state variable first
                      setSelectedChildFieldId(id);
                      // Then update the form
                      field.handleChange(id);
                    }}
                  >
                    {allowedChildFields.map(({ id, name, dataType }) => (
                      <Select.DefaultItem key={id} value={id}>
                        {renderFieldDisplay(name, dataType)}
                      </Select.DefaultItem>
                    ))}
                  </Select.Default>
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
          </div>
          <div className="flex flex-row justify-around gap-2">
            <div className="flex flex-1 flex-col gap-2">
              <FormLabel name="parentTableId">{t('data:create_link.parent_table')}</FormLabel>
              <Select.Default
                value={selectedParentTableId}
                onValueChange={(id) => {
                  setSelectedParentTableId(id);
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
            </div>
            <form.Field name="parentFieldId">
              {(field) => (
                <div className="flex flex-1 flex-col gap-2">
                  <FormLabel name={field.name}>{t('data:create_link.parent_field')}</FormLabel>
                  <Select.Default
                    value={hasValidParentFields ? field.state.value : 'no-valid-options'}
                    onValueChange={field.handleChange}
                    disabled={!hasValidParentFields}
                  >
                    {hasValidParentFields ? (
                      selectedParentTableFields.map(({ id, name, dataType }) => (
                        <Select.DefaultItem key={id} value={id}>
                          {renderFieldDisplay(name, dataType)}
                        </Select.DefaultItem>
                      ))
                    ) : (
                      <Select.DefaultItem value="no-valid-options">
                        {t('data:create_link.no_matching_type_parent_side')}
                      </Select.DefaultItem>
                    )}
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
