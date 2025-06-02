import { Callout } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { Highlight } from '@app-builder/components/Highlight';
import { type TableModel } from '@app-builder/models/data-model';
import { type CustomPivotOption, type LinkPivotOption } from '@app-builder/services/data/pivot';
import { pivotValuesDocHref } from '@app-builder/services/documentation-href';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Input, ModalV2, SelectWithCombobox } from 'ui-design-system';

export function SelectTargetEntity({
  pivotOptions,
  tableModel,
  onSelected,
}: {
  pivotOptions: LinkPivotOption[];
  tableModel: TableModel;
  onSelected: (value: CustomPivotOption) => void;
}) {
  const { t } = useTranslation(['common', 'data']);

  const options = useMemo(
    () =>
      Array.from(
        pivotOptions
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
      ),
    [pivotOptions],
  );

  const form = useForm({
    defaultValues: { pivot: options[0] },
    onSubmit: ({ value }) => {
      onSelected(value.pivot as CustomPivotOption);
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
      <ModalV2.Title>{t('data:create_pivot.title', { table: tableModel.name })}</ModalV2.Title>

      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <Callout variant="outlined">
          <ModalV2.Description className="whitespace-pre text-balance">
            <Trans
              t={t}
              i18nKey="data:create_pivot.entity_selection.description"
              components={{
                DocLink: <ExternalLink href={pivotValuesDocHref} />,
              }}
            />
          </ModalV2.Description>
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
        <div className="flex flex-col gap-4">
          <div className="w-full border-b text-center leading-[0.1em]">
            <span className="text-grey-50 bg-grey-100 px-[10px]">or</span>
          </div>
          <p className="text-grey-50 text-balance">
            <Trans
              t={t}
              i18nKey="data:create_pivot.select_entity.same_table"
              values={{ table: tableModel.name }}
              components={{
                strong: <strong />,
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
            {t('data:create_pivot.select_entity.button_same_table', { table: tableModel.name })}
          </Button>
        </div>
      </div>
    </form>
  );
}
