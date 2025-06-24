import { Callout } from '@app-builder/components';
import type { TableModel } from '@app-builder/models/data-model';
import { type FieldPivotOption } from '@app-builder/services/data/pivot';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm, useStore } from '@tanstack/react-form';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Code, MenuCommand, Modal } from 'ui-design-system';
import { z } from 'zod';

export function SelectField({
  pivotOptions,
  tableModel,
  onSelected,
  onBack,
}: {
  pivotOptions: FieldPivotOption[];
  tableModel: TableModel;
  onSelected: (value: FieldPivotOption) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation(['common', 'data']);

  const form = useForm({
    defaultValues: { pivot: pivotOptions[0] ?? null },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        if (value.pivot?.type === 'field') {
          onSelected(value.pivot as FieldPivotOption);
        }
      }
    },
  });

  const selectedOption = useStore(form.store, (state) => state.values.pivot);
  const [open, onOpenChange] = useState(false);

  const pivotFieldShape = z.object({ pivot: z.any() }).shape;

  return (
    <form onSubmit={handleSubmit(form)}>
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <Modal.Description className="whitespace-pre text-wrap">
          <Trans
            t={t}
            i18nKey="data:create_pivot.select_field.description"
            values={{ table: tableModel.name }}
            components={{
              Code: <Code />,
            }}
          />
        </Modal.Description>
        <Callout variant="outlined" color="red">
          <Trans
            t={t}
            i18nKey="data:create_pivot.select_field.callout"
            values={{ table: tableModel.name }}
            parent="p"
            components={{
              Code: <Code />,
            }}
          />
        </Callout>

        <form.Field
          name="pivot"
          validators={{ onChange: pivotFieldShape.pivot, onBlur: pivotFieldShape.pivot }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <MenuCommand.Menu {...{ open, onOpenChange }}>
                <MenuCommand.Trigger>
                  <MenuCommand.SelectButton>
                    {selectedOption?.displayValue}
                  </MenuCommand.SelectButton>
                </MenuCommand.Trigger>

                <MenuCommand.Content align="start" sameWidth sideOffset={4}>
                  <MenuCommand.Combobox
                    placeholder={t('data:create_pivot.entity_selection.search.placeholder')}
                  />

                  <MenuCommand.List>
                    {pivotOptions.map((pivot) => (
                      <MenuCommand.Item
                        key={pivot.id}
                        onSelect={() => {
                          field.handleChange(pivot);
                          onOpenChange(false);
                        }}
                      >
                        <span className="font-semibold">{pivot.displayValue}</span>
                      </MenuCommand.Item>
                    ))}
                  </MenuCommand.List>
                </MenuCommand.Content>
              </MenuCommand.Menu>
            </div>
          )}
        </form.Field>

        <div className="flex flex-1 flex-row gap-2">
          <Button className="flex-1" variant="secondary" onClick={onBack}>
            {t('common:back')}
          </Button>

          <Button className="flex-1" variant="primary" type="submit" disabled={!form.state.isValid}>
            {t('common:validate')}
          </Button>
        </div>
      </div>
    </form>
  );
}
