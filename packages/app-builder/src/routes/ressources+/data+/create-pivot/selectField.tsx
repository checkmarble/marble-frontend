import { Callout } from '@app-builder/components';
import { PivotType } from '@app-builder/components/Data/PivotDetails';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { Highlight } from '@app-builder/components/Highlight';
import type { TableModel } from '@app-builder/models/data-model';
import { type FieldPivotOption, getFieldPivotOptions } from '@app-builder/services/data/pivot';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { matchSorter } from 'match-sorter';
import Code from 'packages/ui-design-system/src/Code/Code';
import { useDeferredValue, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Input, ModalV2, SelectWithCombobox } from 'ui-design-system';

export function SelectField({
  tableModel,
  onSelected,
  onBack,
}: {
  tableModel: TableModel;
  onSelected: (value: FieldPivotOption) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation(['common', 'data']);

  const options = useMemo(() => getFieldPivotOptions(tableModel), [tableModel]);

  const form = useForm({
    defaultValues: { pivot: options[0] ?? null },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        if (value.pivot?.type === 'field') {
          onSelected(value.pivot as FieldPivotOption);
        }
      }
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
        <ModalV2.Description className="whitespace-pre text-wrap">
          <Trans
            t={t}
            i18nKey="data:create_pivot.select_field.description"
            values={{ table: tableModel.name }}
            components={{
              Code: <Code />,
            }}
          />
        </ModalV2.Description>
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

        <form.Field name="pivot">
          {(field) => (
            <div className="flex flex-col gap-2">
              <SelectWithCombobox.Root
                searchValue={searchValue}
                onSearchValueChange={setSearchValue}
                selectedValue={field.state.value?.id}
                onSelectedValueChange={(value): void => {
                  field.handleChange(
                    options.find((pivot) => pivot.id === value) as FieldPivotOption,
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
                  />
                  <SelectWithCombobox.ComboboxList>
                    {matches.map((pivot) => (
                      <SelectWithCombobox.ComboboxItem
                        key={pivot.id}
                        value={pivot.id}
                        className="flex items-center justify-between"
                      >
                        <Highlight text={pivot.displayValue} query={deferredSearchValue} />
                        <PivotType type={pivot.type} />
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
          <Button className="flex-1" variant="secondary" onClick={onBack}>
            {t('common:back')}
          </Button>

          <Button className="flex-1" variant="primary" type="submit" disabled={!form.state.isValid}>
            {t('data:create_pivot.button_accept')}
          </Button>
        </div>
      </div>
    </form>
  );
}
