import { Highlight } from '@app-builder/components/Highlight';
import {
  type AstNode,
  type DataType,
  getConstantDataTypeTKey,
  getDataTypeIcon,
} from '@app-builder/models';
import { type OperandType } from '@app-builder/models/operand-type';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { MenuItem } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

import { OperandInfos } from '../OperandInfos';

interface OperandMenuItemProps extends React.ComponentProps<typeof MenuItem> {
  leftIcon?: IconName;
  children: React.ReactNode;
}

function MenuItemContainer({ className, children, leftIcon, ...props }: OperandMenuItemProps) {
  return (
    <MenuItem
      className={clsx(
        'data-[active-item]:bg-purple-98 grid w-full select-none grid-cols-[20px_1fr] gap-1 rounded-sm p-2 outline-none',
        className,
      )}
      {...props}
    >
      {leftIcon ? (
        <Icon aria-hidden="true" className="col-start-1 size-5 shrink-0" icon={leftIcon} />
      ) : null}
      <div className="col-start-2 flex flex-row gap-1 overflow-hidden">{children}</div>
    </MenuItem>
  );
}

function MenuItemLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={clsx('text-grey-00 text-s w-full break-all text-start font-normal', className)}
      {...props}
    />
  );
}

export function FunctionOption({
  displayName,
  onClick,
}: {
  displayName: string;
  onClick: () => void;
}) {
  return (
    <MenuItemContainer onClick={onClick}>
      <MenuItemLabel>{displayName}</MenuItemLabel>
    </MenuItemContainer>
  );
}

export function CoercedConstantOption({
  displayName,
  dataType,
  onClick,
}: {
  displayName: string;
  dataType: DataType;
  onClick: () => void;
}) {
  const { t } = useTranslation('scenarios');
  const dataTypeIcon = getDataTypeIcon(dataType);
  const constantDataTypeTKey = getConstantDataTypeTKey(dataType);

  return (
    <MenuItemContainer onClick={onClick} leftIcon={dataTypeIcon}>
      <MenuItemLabel>{displayName}</MenuItemLabel>
      {constantDataTypeTKey ? (
        <span className="text-s text-purple-65 shrink-0 font-semibold">
          {t(constantDataTypeTKey)}
        </span>
      ) : null}
    </MenuItemContainer>
  );
}

export function OperandOption({
  searchValue,
  astNode,
  dataType,
  operandType,
  displayName,
  icon,
  onClick,
}: {
  searchValue?: string;
  astNode: AstNode;
  dataType: DataType;
  operandType: OperandType;
  displayName: string;
  icon?: IconName;
  onClick: () => void;
}) {
  const optionIcon = icon ?? getDataTypeIcon(dataType);

  return (
    <MenuItemContainer onClick={onClick} className="group" leftIcon={optionIcon}>
      <MenuItemLabel>
        {searchValue ? <Highlight text={displayName} query={searchValue} /> : displayName}
      </MenuItemLabel>
      <OperandInfos
        gutter={24}
        shift={-8}
        className="group-data-[active-item]:hover:text-purple-65 group-data-[active-item]:text-purple-82 size-5 shrink-0 text-transparent"
        astNode={astNode}
        dataType={dataType}
        operandType={operandType}
        displayName={displayName}
      />
    </MenuItemContainer>
  );
}
