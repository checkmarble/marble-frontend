import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  type DataModelField,
  EnumDataTypes,
  type LinkToSingle,
  UniqueDataTypes,
} from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { captureUnexpectedRemixError } from '@app-builder/services/monitoring';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm, useStore } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Modal } from 'ui-design-system';
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

type EditFieldForm = z.infer<typeof editFieldFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, raw, { dataModelRepository }] = await Promise.all([
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = editFieldFormSchema.safeParse(raw);

  if (!success) return json({ success: 'false', errors: error.flatten() });
  const { description, fieldId, isEnum, isUnique } = data;

  try {
    await dataModelRepository.patchDataModelField(fieldId, {
      description,
      isEnum,
      isUnique,
    });

    return json({ success: 'true', errors: [] });
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    captureUnexpectedRemixError(error, 'editField@action', request);

    return json(
      { success: 'false', errors: [] },
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
  if (field.unicityConstraint !== 'no_unicity_constraint' && field.name === 'object_id') {
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
  const linksToThisField = linksToThisTable.filter((link) => link.parentFieldName === field.name);
  if (field.unicityConstraint !== 'no_unicity_constraint' && linksToThisField.length > 0) {
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

  const form = useForm({
    defaultValues: {
      description: inputField.description,
      fieldId: inputField.id,
      isEnum: inputField.isEnum,
      isUnique: inputField.unicityConstraint !== 'no_unicity_constraint',
    } as EditFieldForm,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/data/editField'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChangeAsync: editFieldFormSchema,
      onBlurAsync: editFieldFormSchema,
      onSubmitAsync: editFieldFormSchema,
    },
  });

  const [isOpen, setIsOpen] = useState(false);

  const selectedEnum = useStore(form.store, (state) => state.values.isEnum);
  const selectedUnique = useStore(form.store, (state) => state.values.isUnique);
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Modal.Title>{t('data:edit_field.title')}</Modal.Title>
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-1 flex-col gap-4">
              <form.Field name="description">
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <FormLabel name={field.name}>{t('data:description')}</FormLabel>
                    <FormInput
                      type="text"
                      name={field.name}
                      defaultValue={field.state.value as string}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      valid={field.state.meta.errors.length === 0}
                      placeholder={t('data:create_field.description_placeholder')}
                    />
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
            </div>
            {EnumDataTypes.includes(inputField.dataType) ? (
              <form.Field name="isEnum">
                {(field) => (
                  <div className="flex flex-row items-center gap-4">
                    <Checkbox
                      defaultChecked={field.state.value}
                      disabled={selectedUnique}
                      onCheckedChange={(checked) => {
                        if (checked !== 'indeterminate') field.handleChange(checked);
                      }}
                    />
                    <FormLabel name={field.name}>
                      <p>{t('data:create_field.is_enum.title')}</p>
                      <p className="text-xs">{t('data:create_field.is_enum.subtitle')}</p>
                    </FormLabel>
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
            ) : null}
            {UniqueDataTypes.includes(inputField.dataType) ? (
              <form.Field name="isUnique">
                {(field) => (
                  <div className="flex flex-row items-center gap-4">
                    <Checkbox
                      defaultChecked={field.state.value}
                      disabled={uniqueSettingDisabled.disabled}
                      onCheckedChange={(checked) => {
                        if (checked !== 'indeterminate') field.handleChange(checked);
                      }}
                    />
                    <FormLabel name={field.name}>
                      <p>{t('data:edit_field.is_unique.title')}</p>
                      {inputField.unicityConstraint === 'no_unicity_constraint' ? (
                        <p className="text-xs">{t('data:edit_field.is_unique.toggle')}</p>
                      ) : null}
                      {uniqueSettingDisabled.reason === 'cannot_toggle_index_pending' ? (
                        <p className="text-red-74 text-xs">
                          {t('data:edit_field.is_unique.cannot_toggle_index_pending')}
                        </p>
                      ) : null}
                      {uniqueSettingDisabled.reason === 'cannot_untoggle_field_linked' ? (
                        <p className="text-red-74 text-xs">
                          {t('data:edit_field.is_unique.cannot_untoggle_field_linked')}
                        </p>
                      ) : null}
                      {field.state.value &&
                      inputField.unicityConstraint === 'no_unicity_constraint' ? (
                        <p className="text-red-74 text-xs">
                          {t('data:edit_field.is_unique.warning_creation_asynchronous')}
                        </p>
                      ) : null}
                      {inputField.unicityConstraint === 'active_unique_constraint' &&
                      !field.state.value ? (
                        <p className="text-red-74 text-xs">
                          {t('data:edit_field.is_unique.warning_untoggle')}
                        </p>
                      ) : null}
                    </FormLabel>
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
            ) : null}
            <div className="flex flex-1 flex-row gap-2">
              <Modal.Close asChild>
                <Button className="flex-1" variant="secondary">
                  {t('common:cancel')}
                </Button>
              </Modal.Close>
              <Button className="flex-1" variant="primary" type="submit" name="edit">
                {t('data:edit_field.button_accept')}
              </Button>
            </div>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
