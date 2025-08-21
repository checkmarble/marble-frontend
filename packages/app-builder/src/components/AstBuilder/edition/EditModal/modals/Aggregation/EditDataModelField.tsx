import { type DataModel, type DataModelField, getDataTypeIcon } from '@app-builder/models';
import * as Ariakit from '@ariakit/react';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type DataModelFieldOption = {
  tableName: string;
  fieldName: string;
  field: DataModelField;
};

function getDataModelFieldLabel(dataModelField: DataModelFieldOption | null) {
  if (!dataModelField?.fieldName || !dataModelField.tableName) {
    return { rawValue: null, value: null };
  }

  return {
    rawValue: dataModelField,
    value: [dataModelField?.tableName, dataModelField?.fieldName].filter(Boolean).join('.'),
  };
}

export type EditDataModelFieldProps = {
  disabled?: boolean;
  tableName?: string;
  value: DataModelFieldOption | null;
  dataModel: DataModel;
  defaultOpen?: boolean;
  onChange: (value: DataModelFieldOption) => void;
  placeholder?: string;
};

export const EditDataModelField = ({
  disabled,
  tableName,
  value,
  dataModel,
  onChange,
  placeholder,
}: EditDataModelFieldProps) => {
  const { t } = useTranslation(['scenarios']);
  const [open, setOpen] = useState(false);
  const options = dataModel.flatMap((table) =>
    table.fields.map((field) => ({
      tableName: table.name,
      fieldName: field.name,
      field,
    })),
  );
  const groups = R.groupBy(options, (option) => option.tableName ?? '');
  const optionsEntries = R.entries(groups);

  const { rawValue, value: selectedValue } = getDataModelFieldLabel(value);
  const showPlaceholder = !selectedValue;

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <button
          disabled={disabled}
          className="border-grey-90 text-s bg-grey-100 aria-disabled:bg-grey-98 text-grey-00 flex h-10 items-center justify-between rounded-sm border px-2"
        >
          {showPlaceholder ? (
            <span>{placeholder}</span>
          ) : (
            <span>
              <Trans t={t} i18nKey="scenarios:edit_aggregation.field_in_table" values={rawValue} />
            </span>
          )}
          <Icon icon="arrow-2-down" className="size-5" />
        </button>
      </MenuCommand.Trigger>
      <MenuCommand.Content className="text-s w-[300px]" align="start" sideOffset={4}>
        {!tableName ? (
          <MenuCommand.List>
            {optionsEntries.map(([tableName, fields]) => {
              return (
                <MenuCommand.SubMenu
                  key={tableName}
                  trigger={<span>{tableName}</span>}
                  className="text-s w-[300px]"
                >
                  <EditDataModelFieldTableMenu
                    tableName={tableName}
                    fields={fields}
                    onChange={onChange}
                  />
                </MenuCommand.SubMenu>
              );
            })}
          </MenuCommand.List>
        ) : (
          <EditDataModelFieldTableMenu tableName={tableName} fields={options} onChange={onChange} />
        )}
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
};

type EditDataModelFieldTableMenuProps = {
  tableName: string;
  fields: DataModelFieldOption[];
  onChange: (field: DataModelFieldOption) => void;
};

export const EditDataModelFieldTableMenu = ({
  tableName,
  fields,
  onChange,
}: EditDataModelFieldTableMenuProps) => {
  const { t } = useTranslation(['scenarios']);
  return (
    <MenuCommand.List>
      <MenuCommand.Group
        heading={
          <div className="text-grey-50 mb-2 items-center px-2 pb-2 text-xs">
            <Trans
              t={t}
              i18nKey="scenarios:edit_aggregation.available_fields"
              values={{ tableName }}
            />
          </div>
        }
      >
        {fields.map((field) => {
          const typeIcon = getDataTypeIcon(field.field.dataType);
          return (
            <MenuCommand.Item
              key={field.fieldName}
              className="data-active-item:bg-purple-98 group grid w-full select-none grid-cols-[20px_1fr] gap-1 rounded-xs p-2 outline-hidden"
              onSelect={() => onChange(field)}
            >
              {typeIcon ? <Icon icon={typeIcon} className="col-start-1 size-5 shrink-0" /> : null}
              <div className="col-start-2 flex items-center justify-between">
                <span>{field.fieldName}</span>
                <FieldInfo field={field.field} />
              </div>
            </MenuCommand.Item>
          );
        })}
      </MenuCommand.Group>
    </MenuCommand.List>
  );
};

function FieldInfo({ field }: { field: DataModelField }) {
  const { i18n } = useTranslation();

  return (
    <Ariakit.HovercardProvider
      showTimeout={0}
      hideTimeout={0}
      placement={i18n.dir() === 'ltr' ? 'right-start' : 'left-start'}
    >
      <Ariakit.HovercardAnchor tabIndex={-1}>
        <Icon
          icon="tip"
          className="hover:group-hover:text-purple-65 group-hover:text-purple-82 size-5 shrink-0 text-transparent transition-colors"
        />
      </Ariakit.HovercardAnchor>
      <Ariakit.Hovercard
        unmountOnHide
        gutter={24}
        shift={-8}
        portal
        className="bg-grey-100 border-grey-90 text-s flex max-h-[min(var(--popover-available-height),400px)] max-w-(--popover-available-width) rounded-sm border shadow-md"
      >
        <div className="p-4">{field.description}</div>
      </Ariakit.Hovercard>
    </Ariakit.HovercardProvider>
  );
}
