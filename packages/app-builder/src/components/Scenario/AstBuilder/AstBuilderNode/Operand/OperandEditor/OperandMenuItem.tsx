import { type DataType, type LabelledAst } from '@app-builder/models';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { MenuItem } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

import { OperandDescription, OperandInfos } from '../OperandInfos';
import { getConstantDataTypeTKey, getDataTypeIcon } from '../utils';

interface OperandMenuItemProps extends React.ComponentProps<typeof MenuItem> {
  leftIcon?: IconName;
  children: React.ReactNode;
}

function MenuItemContainer({
  className,
  children,
  leftIcon,
  ...props
}: OperandMenuItemProps) {
  return (
    <MenuItem
      className={clsx(
        'data-[active-item]:bg-purple-05 grid w-full select-none grid-cols-[20px_1fr] gap-1 rounded-sm p-2 outline-none',
        className,
      )}
      {...props}
    >
      {leftIcon ? (
        <Icon
          aria-hidden="true"
          className="col-start-1 size-5 shrink-0"
          icon={leftIcon}
        />
      ) : null}
      <div className="col-start-2 flex flex-row gap-1 overflow-hidden">
        {children}
      </div>
    </MenuItem>
  );
}

function MenuItemLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={clsx(
        'text-grey-100 text-s w-full overflow-hidden text-ellipsis text-start font-normal',
        className,
      )}
      {...props}
    />
  );
}

export function ConstantOption({
  label,
  dataType,
  onSelect,
}: {
  label: React.ReactNode;
  dataType: DataType;
  onSelect: () => void;
}) {
  const { t } = useTranslation('scenarios');
  const dataTypeIcon = getDataTypeIcon(dataType);
  const constantDataTypeTKey = getConstantDataTypeTKey(dataType);

  return (
    <MenuItemContainer onClick={onSelect} leftIcon={dataTypeIcon}>
      <MenuItemLabel>{label}</MenuItemLabel>
      {constantDataTypeTKey ? (
        <span className="text-s shrink-0 font-semibold text-purple-100">
          {t(constantDataTypeTKey)}
        </span>
      ) : null}
    </MenuItemContainer>
  );
}

export function OperandOption({
  label,
  dataType,
  option,
  onSelect,
}: {
  label: React.ReactNode;
  dataType: DataType;
  option: LabelledAst;
  onSelect: () => void;
}) {
  const dataTypeIcon = getDataTypeIcon(dataType);
  return (
    <MenuItemContainer
      onClick={onSelect}
      className="group"
      leftIcon={dataTypeIcon}
    >
      <MenuItemLabel>{label}</MenuItemLabel>
      <OperandInfos
        gutter={24}
        shift={-8}
        className="size-5 shrink-0 text-transparent transition-colors group-data-[active-item]:text-purple-50 group-data-[active-item]:hover:text-purple-100"
      >
        <OperandDescription option={option} />
      </OperandInfos>
    </MenuItemContainer>
  );
}
