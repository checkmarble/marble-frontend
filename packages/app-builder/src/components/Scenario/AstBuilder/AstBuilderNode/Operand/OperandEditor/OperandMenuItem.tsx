import { Highlight } from '@app-builder/components/Highlight';
import { type LabelledAst } from '@app-builder/models';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { MenuItem } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

import { OperandDescription, OperandTooltip } from '../OperandTooltip';
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
        'data-[active-item]:bg-purple-05 grid w-full select-none grid-cols-[20px_1fr] gap-1 rounded-sm p-2 outline-none transition-colors',
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
  constant,
  onSelect,
}: {
  constant: LabelledAst;
  onSelect: () => void;
}) {
  const { t } = useTranslation('scenarios');
  const dataTypeIcon = getDataTypeIcon(constant.dataType);
  const constantDataTypeTKey = getConstantDataTypeTKey(constant.dataType);

  return (
    <MenuItemContainer onClick={onSelect} leftIcon={dataTypeIcon}>
      <MenuItemLabel>{constant.name}</MenuItemLabel>
      {constantDataTypeTKey ? (
        <span className="text-s shrink-0 font-semibold text-purple-100">
          {t(constantDataTypeTKey)}
        </span>
      ) : null}
    </MenuItemContainer>
  );
}

export function OperandOption({
  searchText = '',
  option,
  onSelect,
}: {
  searchText?: string;
  option: LabelledAst;
  onSelect: () => void;
}) {
  const dataTypeIcon = getDataTypeIcon(option.dataType);
  return (
    <MenuItemContainer
      onClick={onSelect}
      className="group"
      leftIcon={dataTypeIcon}
    >
      <MenuItemLabel>
        <Highlight text={option.name} query={searchText} />
      </MenuItemLabel>
      <OperandTooltip
        content={
          <OperandDescription
            operand={{
              name: option.name,
              operandType: option.operandType,
              dataType: option.dataType,
              description: option.description,
              values: option.values,
            }}
          />
        }
        sideOffset={24}
        alignOffset={-8}
      >
        <Icon
          icon="tip"
          className="size-5 shrink-0 text-transparent transition-colors group-data-[active-item]:text-purple-50 group-data-[active-item]:hover:text-purple-100"
        />
      </OperandTooltip>
    </MenuItemContainer>
  );
}
