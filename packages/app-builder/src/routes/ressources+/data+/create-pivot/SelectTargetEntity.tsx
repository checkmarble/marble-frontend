import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { Highlight } from '@app-builder/components/Highlight';
import { type TableModel } from '@app-builder/models/data-model';
import { type LinkPivotOption, type PivotOption } from '@app-builder/services/data/pivot';
import { pivotValuesDocHref } from '@app-builder/services/documentation-href';
import { getFieldErrors } from '@app-builder/utils/form';
import * as Sentry from '@sentry/remix';
import { useForm } from '@tanstack/react-form';
import { matchSorter } from 'match-sorter';
import Code from 'packages/ui-design-system/src/Code/Code';
import { useDeferredValue, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Input, ModalV2, SelectWithCombobox } from 'ui-design-system';

export function SelectTargetEntity({
  pivotOptions,
  hasFieldOptions,
  tableModel,
  onSelected,
}: {
  pivotOptions: LinkPivotOption[];
  hasFieldOptions: boolean;
  tableModel: TableModel;
  onSelected: (value: PivotOption) => void;
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

  console.log('SelectTargetEntity options', options);

  const form = useForm({
    defaultValues: { pivot: options[0] },
    onSubmit: ({ value }) => {
      onSelected(value.pivot as PivotOption);
    },
  });

  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const matches = useMemo(
    () =>
      matchSorter(options, deferredSearchValue, {
        keys: ['displayValue'],
      }),
    [options, deferredSearchValue],
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <ModalV2.Description className="whitespace-pre text-balance">
          <Trans
            t={t}
            i18nKey="data:create_pivot.entity_selection.description"
            values={{ table: tableModel.name }}
            components={{
              Code: <Code />,
              DocLink: <ExternalLink href={pivotValuesDocHref} />,
            }}
          />
        </ModalV2.Description>

        <form.Field name="pivot">
          {(field) => (
            <div className="flex flex-col gap-2">
              <SelectWithCombobox.Root
                searchValue={searchValue}
                onSearchValueChange={setSearchValue}
                selectedValue={field.state.value?.id}
                onSelectedValueChange={(value): void => {
                  field.handleChange(
                    options.find((pivot) => pivot.id === value) as LinkPivotOption,
                  );
                }}
              >
                <SelectWithCombobox.Select className="w-full">
                  {field.state.value?.displayValue}
                  <SelectWithCombobox.Arrow />
                </SelectWithCombobox.Select>
                <SelectWithCombobox.Popover
                  className="z-50 flex flex-col gap-2 p-2"
                  portal
                  sameWidth
                >
                  <SelectWithCombobox.Combobox
                    render={<Input className="shrink-0" />}
                    autoSelect
                    autoFocus
                    placeholder={t('data:create_pivot.select_entity.search_placeholder')}
                  />
                  <SelectWithCombobox.ComboboxList>
                    {matches.map((pivot) => (
                      <SelectWithCombobox.ComboboxItem
                        key={pivot.id}
                        value={pivot.id}
                        className="flex items-center justify-between"
                      >
                        <Highlight text={pivot.displayValue} query={deferredSearchValue} />
                      </SelectWithCombobox.ComboboxItem>
                    ))}
                    {matches.length === 0 ? (
                      <p className="text-grey-50 flex items-center justify-center p-2">
                        {t('data:create_pivot.select.empty_matches')}
                      </p>
                    ) : null}
                  </SelectWithCombobox.ComboboxList>
                </SelectWithCombobox.Popover>
              </SelectWithCombobox.Root>
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close render={<Button className="flex-1" variant="secondary" />}>
            {t('common:cancel')}
          </ModalV2.Close>

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
