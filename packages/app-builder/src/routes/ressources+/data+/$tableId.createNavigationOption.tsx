import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type DataModel, isStatusConflictHttpError, type LinkToSingle } from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { useCallbackRef } from '@marble/shared';
import { type ActionFunctionArgs } from '@remix-run/node';
import { json, useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { Button, MenuCommand, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

const createNavigationOptionSchema = z.object({
  sourceFieldId: z.uuid(),
  targetTableId: z.uuid(),
  filterFieldId: z.uuid(),
  orderingFieldId: z.uuid(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService,
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const [session, data, t] = await Promise.all([
    getSession(request),
    request.json(),
    i18nextService.getFixedT(request, ['common', 'data']),
  ]);

  const options = createNavigationOptionSchema.safeParse(data);
  const sourceTableId = params['tableId'];

  invariant(sourceTableId, 'Expected tableId to be in URL');

  if (!options.success) {
    const { errors } = z.treeifyError(options.error);
    return { success: false, errors };
  }

  try {
    await dataModelRepository.createNavigationOption(sourceTableId, options.data);

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return json(
      { success: true },
      {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      },
    );
  } catch (err) {
    let message = t('common:errors.unknown');
    if (isStatusConflictHttpError(err)) {
      message = t('data:create_navigation_option.errors.duplicate_pivot_value');
    }

    setToastMessage(session, {
      type: 'error',
      message,
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export type CreateNavigationOptionModalProps = {
  label: string;
  dataModel: DataModel;
  link: LinkToSingle;
};

export function CreateNavigationOptionModal({
  label,
  dataModel,
  link,
}: CreateNavigationOptionModalProps) {
  const { t } = useTranslation(['common', 'data']);
  const targetTable = dataModel.find((table) => {
    return table.name === link.childTableName;
  });
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher({
    key: `create_navigation_option_${link.parentTableId}_${link.childTableId}`,
  });

  const handleOpenChange = useCallbackRef((open: boolean) => {
    if (!open) {
      form.resetField('orderingFieldId');
      setOpen(false);
    }
  });

  const form = useForm({
    defaultValues: {
      sourceFieldId: link.parentFieldId,
      targetTableId: link.childTableId,
      filterFieldId: link.childFieldId,
      orderingFieldId: '',
    },
    validators: {
      onChange: createNavigationOptionSchema,
    },
    onSubmit({ value, formApi }) {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          encType: 'application/json',
          action: getRoute('/ressources/data/:tableId/createNavigationOption', {
            tableId: link.parentTableId,
          }),
        });
      }
    },
  });

  if (!targetTable) {
    return null;
  }

  return (
    <Modal.Root onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button size="small" variant="secondary">
          {label}
          <Icon icon="plus" className="size-4" />
        </Button>
      </Modal.Trigger>
      <Modal.Content size="medium">
        <Modal.Title>{t('data:create_navigation_option.title')}</Modal.Title>
        <form
          id={`create_navigation_option_form_${link.parentTableId}_${link.childTableId}`}
          className="grid grid-cols-[auto_1fr] items-center gap-2 p-8"
          onSubmit={handleSubmit(form)}
        >
          <span>{t('data:create_navigation_option.labels.from')}</span>
          <div>
            <MenuCommand.SelectButton disabled noArrow>
              {link.parentTableName}
            </MenuCommand.SelectButton>
          </div>
          <span>{t('data:create_navigation_option.labels.to')}</span>
          <div>
            <MenuCommand.SelectButton disabled noArrow>
              {link.childTableName}
            </MenuCommand.SelectButton>
          </div>
          <span className="h-10 place-self-start leading-10">
            {t('data:create_navigation_option.labels.ordered_by')}
          </span>
          <div>
            <form.Field
              name="orderingFieldId"
              validators={{
                onChange: createNavigationOptionSchema.shape.orderingFieldId,
                onBlur: createNavigationOptionSchema.shape.orderingFieldId,
              }}
            >
              {(formField) => {
                const selectedField = targetTable.fields.find(
                  (tableField) => tableField.id === formField.state.value,
                );
                const fieldErrors = formField.state.meta.errors;
                const targetFields = targetTable.fields.filter(
                  (tableField) => tableField.id !== link.childFieldId,
                );

                return (
                  <>
                    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
                      <MenuCommand.Trigger>
                        <MenuCommand.SelectButton
                          className="inline-flex min-w-[264px]"
                          hasError={fieldErrors.length > 0}
                        >
                          {selectedField
                            ? selectedField.name
                            : t('data:create_navigation_option.placeholders.ordered_by')}
                        </MenuCommand.SelectButton>
                      </MenuCommand.Trigger>
                      <MenuCommand.Content align="start" sameWidth sideOffset={4}>
                        <MenuCommand.List>
                          {targetFields.map((field) => (
                            <MenuCommand.Item
                              key={field.id}
                              value={field.id}
                              onSelect={formField.handleChange}
                            >
                              {field.name}
                              {selectedField?.name === field.name ? (
                                <Icon icon="tick" className="text-purple-65 size-6" />
                              ) : null}
                            </MenuCommand.Item>
                          ))}
                        </MenuCommand.List>
                      </MenuCommand.Content>
                    </MenuCommand.Menu>
                    <FormErrorOrDescription errors={getFieldErrors(fieldErrors)} />
                  </>
                );
              }}
            </form.Field>
          </div>
          <div className="col-span-full mt-4">
            {t('data:create_navigation_option.explanation_text')}
          </div>
        </form>
        <Modal.Footer>
          <div className="flex flex-1 flex-row gap-2 p-4">
            <Modal.Close asChild>
              <Button variant="secondary" className="flex-1">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button
              type="submit"
              form={`create_navigation_option_form_${link.parentTableId}_${link.childTableId}`}
              variant="primary"
              className="flex-1"
            >
              {t('common:save')}
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
