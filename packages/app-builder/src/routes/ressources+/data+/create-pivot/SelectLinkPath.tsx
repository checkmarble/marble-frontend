import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { type TableModel } from '@app-builder/models/data-model';
import { type LinkPivotOption } from '@app-builder/services/data/pivot';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm, useStore } from '@tanstack/react-form';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Code, MenuCommand } from 'ui-design-system';

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
      pivotOptions
        .filter(
          ({ type, parentTableId }) =>
            type === 'link' && parentTableId === preferedPivotOption.parentTableId,
        )
        .sort((a, b) => (a.length ?? 0) - (b.length ?? 0)),
    [pivotOptions, preferedPivotOption],
  );

  const form = useForm({
    defaultValues: { pivot: preferedPivotOption },
    onSubmit: ({ value: { pivot } }) => {
      onSelected(pivot);
    },
  });

  const selectedOption = useStore(form.store, (state) => state.values.pivot);
  const [open, onOpenChange] = useState(false);
  return (
    <form onSubmit={handleSubmit(form)}>
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <form.Field name="pivot">
          {(field) => (
            <div className="flex flex-col gap-2">
              {pathOptions.length > 1 ? (
                <>
                  <FormLabel name={field.name}>
                    <Trans
                      t={t}
                      i18nKey="data:create_pivot.select_path.description"
                      values={{
                        child: tableModel.name,
                        parent: preferedPivotOption.parentTableName,
                      }}
                      components={{
                        Code: <Code />,
                      }}
                    />
                  </FormLabel>
                  <MenuCommand.Menu {...{ open, onOpenChange }}>
                    <MenuCommand.Trigger>
                      <MenuCommand.SelectButton>
                        {selectedOption?.displayPath ?? preferedPivotOption?.displayPath}
                      </MenuCommand.SelectButton>
                    </MenuCommand.Trigger>
                    <MenuCommand.Content align="start" sameWidth sideOffset={4}>
                      <MenuCommand.List>
                        {pathOptions.map((option) => (
                          <MenuCommand.Item
                            key={option.id}
                            onSelect={() => {
                              field.handleChange(option);
                              onOpenChange(false);
                            }}
                          >
                            <span className="text-s text-grey-00 font-medium">
                              {option.displayPath ?? option.displayValue}
                            </span>
                          </MenuCommand.Item>
                        ))}
                      </MenuCommand.List>
                    </MenuCommand.Content>
                  </MenuCommand.Menu>
                </>
              ) : (
                <FormLabel name={field.name}>
                  <Trans
                    t={t}
                    i18nKey="data:create_pivot.validate_path.description"
                    values={{
                      child: tableModel.name,
                      parent: preferedPivotOption.parentTableName,
                      link: preferedPivotOption.displayValue,
                    }}
                    components={{
                      Code: <Code />,
                    }}
                  />
                </FormLabel>
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
