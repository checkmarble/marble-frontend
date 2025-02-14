import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import {
  MenuButton,
  MenuContent,
  MenuItem,
  MenuPopover,
  MenuRoot,
  ScrollAreaV2,
  SubMenuButton,
  SubMenuRoot,
} from 'ui-design-system';
import { Icon } from 'ui-icons';

export type DataModelField = {
  tableName: string;
  fieldName: string;
};

function getDataModelFieldLabel(dataModelField: DataModelField | null) {
  if (!dataModelField?.fieldName || !dataModelField.tableName) {
    return { rawValue: null, value: null };
  }

  return {
    rawValue: dataModelField,
    value: [dataModelField?.tableName, dataModelField?.fieldName]
      .filter(Boolean)
      .join('.'),
  };
}

export type EditDataModelFieldProps = {
  disabled?: boolean;
  tableName?: string;
  value: DataModelField | null;
  options: DataModelField[];
  defaultOpen?: boolean;
  onChange: (value: DataModelField) => void;
  placeholder?: string;
};

export const EditDataModelField = ({
  disabled,
  tableName,
  value,
  options,
  onChange,
  placeholder,
}: EditDataModelFieldProps) => {
  const { t } = useTranslation(['scenarios']);
  const groups = R.groupBy(options, (option) => option.tableName ?? '');
  const optionsEntries = R.entries(groups);

  const { rawValue, value: selectedValue } = getDataModelFieldLabel(value);
  const showPlaceholder = !selectedValue;

  return (
    <MenuRoot>
      <MenuButton
        disabled={disabled}
        render={
          <div className="border-grey-90 text-s aria-disabled:bg-grey-98 text-grey-00 flex h-10 items-center justify-between rounded border px-2" />
        }
      >
        {showPlaceholder ? (
          <div>{placeholder}</div>
        ) : (
          <div>
            <Trans
              t={t}
              i18nKey="scenarios:edit_aggregation.field_in_table"
              values={rawValue}
            />
          </div>
        )}
        <Icon icon="arrow-2-down" className="size-5" />
      </MenuButton>
      {!tableName ? (
        <MenuPopover gutter={4} className="text-s flex w-72 flex-col gap-2 p-2">
          <MenuContent>
            <ScrollAreaV2 type="auto">
              {optionsEntries.map(([tableName, fields]) => {
                return (
                  <SubMenuRoot key={tableName}>
                    <SubMenuButton className="data-[active-item]:bg-purple-98 flex min-h-10 scroll-mb-2 scroll-mt-12 flex-row items-center justify-between gap-2 rounded-sm p-2 outline-none">
                      <span>{tableName}</span>
                      <Icon icon="arrow-right" className="size-5" />
                    </SubMenuButton>
                    <EditDataModelFieldTableMenu
                      tableName={tableName}
                      fields={fields}
                      onChange={onChange}
                    />
                  </SubMenuRoot>
                );
              })}
            </ScrollAreaV2>
          </MenuContent>
        </MenuPopover>
      ) : (
        <EditDataModelFieldTableMenu
          tableName={tableName}
          fields={options}
          onChange={onChange}
        />
      )}
    </MenuRoot>
  );
};

type EditDataModelFieldTableMenuProps = {
  tableName: string;
  fields: DataModelField[];
  onChange: (field: DataModelField) => void;
};

export const EditDataModelFieldTableMenu = ({
  tableName,
  fields,
  onChange,
}: EditDataModelFieldTableMenuProps) => {
  const { t } = useTranslation(['scenarios']);
  return (
    <MenuPopover gutter={12}>
      <MenuContent className="text-s flex w-72 flex-col gap-2 p-2">
        <div className="text-grey-50 items-center px-4 py-2 text-xs">
          <Trans
            t={t}
            i18nKey="scenarios:edit_aggregation.available_fields"
            values={{ tableName }}
          />
        </div>
        <ScrollAreaV2 type="auto">
          {fields.map((field) => {
            return (
              <MenuItem
                key={field.fieldName}
                className="data-[active-item]:bg-purple-98 grid w-full select-none gap-1 rounded-sm p-2 outline-none"
                onClick={() => onChange(field)}
              >
                {field.fieldName}
              </MenuItem>
            );
          })}
        </ScrollAreaV2>
      </MenuContent>
    </MenuPopover>
  );
};
