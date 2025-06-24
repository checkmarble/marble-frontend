import { ExternalLink } from '@app-builder/components/ExternalLink';
import { type TableModel } from '@app-builder/models/data-model';
import { type CustomPivotOption, type LinkPivotOption } from '@app-builder/services/data/pivot';
import { pivotValuesDocHref } from '@app-builder/services/documentation-href';
import { handleSubmit } from '@app-builder/utils/form';
import * as Sentry from '@sentry/remix';
import { useForm, useStore } from '@tanstack/react-form';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Code, MenuCommand, Modal } from 'ui-design-system';
import { z } from 'zod';

export function SelectTargetEntity({
  pivotOptions,
  hasFieldOptions,
  tableModel,
  onSelected,
}: {
  pivotOptions: LinkPivotOption[];
  hasFieldOptions: boolean;
  tableModel: TableModel;
  onSelected: (value: CustomPivotOption) => void;
}) {
  const { t } = useTranslation(['common', 'data']);

  const options = useMemo(() => {
    const objectIdField = tableModel.fields.find(({ name }) => name === 'object_id');
    if (!objectIdField) {
      Sentry.captureException(
        new Error(`Table ${tableModel.name} (${tableModel.id}) does not have an objectId field.`),
      );
      return [];
    }

    return [
      ...pivotOptions
        // Filter and reduce to unique links based on parentTableId ordered by shortest path
        .reduce((uniqueLinks, link) => {
          if (!link.parentTableId) return uniqueLinks;

          const existingLink = uniqueLinks.get(link.parentTableId);

          if (!existingLink) {
            uniqueLinks.set(link.parentTableId, link);
            return uniqueLinks;
          }

          if (
            typeof link.length === 'number' &&
            (existingLink.length === undefined || link.length < existingLink.length)
          ) {
            uniqueLinks.set(link.parentTableId, link);
          }
          return uniqueLinks;
        }, new Map<string, LinkPivotOption>())
        .values(),
      {
        baseTableId: tableModel.id,
        displayValue: tableModel.name,
        fieldId: objectIdField.id,
        id: objectIdField.id,
        type: 'field',
      },
    ];
  }, [pivotOptions, tableModel.fields, tableModel.id, tableModel.name]);

  const form = useForm({
    defaultValues: { pivot: options[0] },
    onSubmit: ({ value }) => {
      onSelected(value.pivot as CustomPivotOption);
    },
  });

  const selectedOption = useStore(form.store, (state) => state.values.pivot);
  const [open, onOpenChange] = useState(false);

  const pivotFieldShape = z.object({ pivot: z.any() }).shape;

  return (
    <form onSubmit={handleSubmit(form)}>
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <Modal.Description className="whitespace-pre text-balance">
          <Trans
            t={t}
            i18nKey="data:create_pivot.entity_selection.description"
            values={{ table: tableModel.name }}
            components={{
              Code: <Code />,
              DocLink: <ExternalLink href={pivotValuesDocHref} />,
            }}
          />
        </Modal.Description>

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
                    {options.map((pivot) => (
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
                    {options.length === 0 ? (
                      <p className="text-grey-50 flex items-center justify-center p-2">
                        {t('data:create_pivot.select.empty_matches')}
                      </p>
                    ) : null}
                  </MenuCommand.List>
                </MenuCommand.Content>
              </MenuCommand.Menu>
            </div>
          )}
        </form.Field>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary">
              {t('common:cancel')}
            </Button>
          </Modal.Close>

          <Button className="flex-1" variant="primary" type="submit" disabled={!form.state.isValid}>
            {t('data:create_pivot.entity_selection.button_accept')}
          </Button>
        </div>
        {hasFieldOptions ? (
          <div className="flex flex-col gap-4">
            <div className="w-full border-b text-center leading-[0.1em]">
              <span className="text-grey-50 bg-grey-100 px-[10px]">or</span>
            </div>
            <p className="text-grey-50">
              <Trans
                t={t}
                i18nKey="data:create_pivot.select_entity.same_table"
                values={{ table: tableModel.name }}
                components={{
                  Code: <Code />,
                }}
              />
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                onSelected({
                  type: 'sameTable',
                  baseTableId: tableModel.id,
                  id: `${tableModel.id}`,
                });
              }}
              className="inline-block text-balance"
            >
              <Trans
                t={t}
                i18nKey="data:create_pivot.select_entity.button_same_table"
                values={{ table: tableModel.name }}
                components={{
                  Code: <Code />,
                }}
              />
            </Button>
          </div>
        ) : null}
      </div>
    </form>
  );
}
