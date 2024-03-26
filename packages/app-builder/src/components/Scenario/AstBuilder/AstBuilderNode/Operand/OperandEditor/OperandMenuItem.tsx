import { Highlight } from '@app-builder/components/Highlight';
import { getConstantDataTypeTKey, getDataTypeIcon } from '@app-builder/models';
import {
  type ConstantEditableAstNode,
  type EditableAstNode,
} from '@app-builder/models/editable-ast-node';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { MenuItem } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

import { OperandInfos } from '../OperandInfos';

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

export function CoercedConstantOption({
  constantEditableAstNode,
  onClick,
}: {
  constantEditableAstNode: ConstantEditableAstNode;
  onClick: (option: EditableAstNode) => void;
}) {
  const { t } = useTranslation('scenarios');
  const dataTypeIcon = getDataTypeIcon(constantEditableAstNode.dataType);
  const constantDataTypeTKey = getConstantDataTypeTKey(
    constantEditableAstNode.dataType,
  );

  return (
    <MenuItemContainer
      onClick={() => onClick(constantEditableAstNode)}
      leftIcon={dataTypeIcon}
    >
      <MenuItemLabel>{constantEditableAstNode.displayName}</MenuItemLabel>
      {constantDataTypeTKey ? (
        <span className="text-s shrink-0 font-semibold text-purple-100">
          {t(constantDataTypeTKey)}
        </span>
      ) : null}
    </MenuItemContainer>
  );
}

export function OperandOption({
  searchValue,
  editableAstNode,
  onClick,
}: {
  searchValue: string;
  editableAstNode: EditableAstNode;
  onClick: (option: EditableAstNode) => void;
}) {
  const dataTypeIcon = getDataTypeIcon(editableAstNode.dataType);

  return (
    <MenuItemContainer
      onClick={() => onClick(editableAstNode)}
      className="group"
      leftIcon={dataTypeIcon}
    >
      <MenuItemLabel>
        <Highlight text={editableAstNode.displayName} query={searchValue} />
      </MenuItemLabel>
      <OperandInfos
        gutter={24}
        shift={-8}
        className="size-5 shrink-0 text-transparent transition-colors group-data-[active-item]:text-purple-50 group-data-[active-item]:hover:text-purple-100"
        editableAstNode={editableAstNode}
      />
    </MenuItemContainer>
  );
}
