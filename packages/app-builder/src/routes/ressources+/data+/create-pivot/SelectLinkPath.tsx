import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { type TableModel } from '@app-builder/models/data-model';
import { type LinkPivotOption } from '@app-builder/services/data/pivot';
import { useForm } from '@tanstack/react-form';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2, Select } from 'ui-design-system';

export function SelectLinkPath({
  pivotOptions,
  preferedPivotOption,
  tableModel,
  onSelected,
}: {
  pivotOptions: LinkPivotOption[];
  preferedPivotOption: LinkPivotOption;
  tableModel: TableModel;
  onSelected: (value: LinkPivotOption) => void;
}) {
  const { t } = useTranslation(['common', 'data']);

  const pathOptions = useMemo(
    () =>
      pivotOptions.filter(
        (pivot) =>
          pivot.type === 'link' && pivot.parentTableId === preferedPivotOption.parentTableId,
      ),
    [pivotOptions, preferedPivotOption.parentTableId],
  );

  const form = useForm({
    defaultValues: preferedPivotOption,
    onSubmit: ({ value }) => onSelected(value),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <ModalV2.Title>{t('data:create_pivot.title')}</ModalV2.Title>

      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <form.Field name="id">
          {(field) => (
            <div className="flex flex-col gap-2">
              <FormLabel name={field.name}>
                {t('data:create_pivot.select_path.description', {
                  child: tableModel.name,
                  parent: preferedPivotOption.parentTableName,
                })}
              </FormLabel>
              <Select.Root defaultValue={preferedPivotOption.id}>
                <Select.Trigger id="path">
                  <span className="text-s text-grey-00 w-full text-center font-medium">
                    <Select.Value placeholder="..." />
                  </span>
                </Select.Trigger>
                <Select.Content className="max-h-60">
                  <Select.Viewport>
                    {Array.from(pathOptions).map((option) => {
                      return (
                        <Select.Item
                          className="flex min-w-[110px] flex-col gap-1"
                          key={option.id}
                          value={option.id}
                        >
                          <Select.ItemText>
                            <span className="text-s text-grey-00 font-medium">
                              {option.displayPath ?? option.displayValue}
                            </span>
                          </Select.ItemText>
                        </Select.Item>
                      );
                    })}
                  </Select.Viewport>
                </Select.Content>
              </Select.Root>
            </div>
          )}
        </form.Field>

        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close render={<Button className="flex-1" variant="secondary" />}>
            {t('common:cancel')}
          </ModalV2.Close>

          <Button className="flex-1" variant="primary" type="submit" disabled={!form.state.isValid}>
            {t('data:create_pivot.button_accept')}
          </Button>
        </div>
      </div>
    </form>
  );
}
