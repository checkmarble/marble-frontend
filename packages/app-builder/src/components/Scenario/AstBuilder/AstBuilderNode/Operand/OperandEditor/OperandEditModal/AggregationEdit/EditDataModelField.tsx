import { type DataModel, type DataModelField, getDataTypeIcon } from '@app-builder/models';
import * as Ariakit from '@ariakit/react';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import {
  MenuButton,
  MenuContent,
  MenuItem,
  MenuPopover,
  MenuRoot,
  SubMenuButton,
  SubMenuRoot,
} from 'ui-design-system';
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
    <MenuRoot>
      <MenuButton
        disabled={disabled}
        render={
          <div className="border-grey-90 text-s bg-grey-100 aria-disabled:bg-grey-98 text-grey-00 flex h-10 items-center justify-between rounded border px-2" />
        }
      >
        {showPlaceholder ? (
          <div>{placeholder}</div>
        ) : (
          <div>
            <Trans t={t} i18nKey="scenarios:edit_aggregation.field_in_table" values={rawValue} />
          </div>
        )}
        <Icon icon="arrow-2-down" className="size-5" />
      </MenuButton>
      {!tableName ? (
        <MenuPopover gutter={4} className="text-s flex w-72 flex-col gap-2">
          <MenuContent>
            <div className="scrollbar-gutter-stable flex flex-col gap-2 overflow-y-auto p-2 pe-[var(--scrollbar-width)]">
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
            </div>
          </MenuContent>
        </MenuPopover>
      ) : (
        <EditDataModelFieldTableMenu tableName={tableName} fields={options} onChange={onChange} />
      )}
    </MenuRoot>
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
    <MenuPopover gutter={14}>
      <MenuContent className="text-s flex w-72 flex-col gap-2">
        <div className="text-grey-50 items-center px-4 py-2 text-xs">
          <Trans
            t={t}
            i18nKey="scenarios:edit_aggregation.available_fields"
            values={{ tableName }}
          />
        </div>
        <div className="scrollbar-gutter-stable flex flex-col gap-2 overflow-y-auto p-2 pe-[var(--scrollbar-width)]">
          {fields.map((field) => {
            const typeIcon = getDataTypeIcon(field.field.dataType);
            return (
              <MenuItem
                key={field.fieldName}
                className="data-[active-item]:bg-purple-98 group grid w-full select-none grid-cols-[20px_1fr] gap-1 rounded-sm p-2 outline-none"
                onClick={() => onChange(field)}
              >
                {typeIcon ? <Icon icon={typeIcon} className="col-start-1 size-5 shrink-0" /> : null}
                <div className="col-start-2 flex items-center justify-between">
                  <span>{field.fieldName}</span>
                  <FieldInfo field={field.field} />
                </div>
              </MenuItem>
            );
          })}
        </div>
      </MenuContent>
    </MenuPopover>
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
          className="group-hover:hover:text-purple-65 group-hover:text-purple-82 size-5 shrink-0 text-transparent transition-colors"
        />
      </Ariakit.HovercardAnchor>
      <Ariakit.Hovercard
        unmountOnHide
        gutter={24}
        shift={-8}
        portal
        className="bg-grey-100 border-grey-90 flex max-h-[min(var(--popover-available-height),_400px)] max-w-[var(--popover-available-width)] rounded border shadow-md"
      >
        <div className="p-4">{field.description}</div>
      </Ariakit.Hovercard>
    </Ariakit.HovercardProvider>
  );
}
