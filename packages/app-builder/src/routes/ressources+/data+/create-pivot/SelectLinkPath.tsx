import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { type TableModel } from '@app-builder/models/data-model';
import { type LinkPivotOption } from '@app-builder/services/data/pivot';
import { useForm } from '@tanstack/react-form';
import Code from 'packages/ui-design-system/src/Code/Code';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Input, Select } from 'ui-design-system';

export function SelectLinkPath({
  pivotOptions,
  preferedPivotOption,
  tableModel,
  onSelected,
  onBack,
}: {
  pivotOptions: LinkPivotOption[];
  preferedPivotOption: LinkPivotOption;
  tableModel: TableModel;
  onSelected: (value: LinkPivotOption) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation(['common', 'data']);

  const pathOptions = useMemo(
    () =>
      pivotOptions.filter(
        ({ type, parentTableId }) =>
          type === 'link' && parentTableId === preferedPivotOption.parentTableId,
      ),
    [pivotOptions, preferedPivotOption],
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
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <form.Field name="id">
          {(field) => (
            <div className="flex flex-col gap-2">
              <FormLabel name={field.name}>
                <Trans
                  t={t}
                  i18nKey="data:create_pivot.select_path.description"
                  values={{ child: tableModel.name, parent: preferedPivotOption.parentTableName }}
                  components={{
                    Code: <Code />,
                  }}
                />
              </FormLabel>
              {pathOptions.length > 1 ? (
                <Select.Root defaultValue={preferedPivotOption.id}>
                  <Select.Trigger id="path" disabled={true}>
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
              ) : (
                <Input
                  className="w-1/3"
                  id="field"
                  readOnly={true}
                  value={
                    pathOptions[0]?.type === 'field' ? 'object_id' : pathOptions[0]?.displayValue
                  }
                ></Input>
              )}
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
