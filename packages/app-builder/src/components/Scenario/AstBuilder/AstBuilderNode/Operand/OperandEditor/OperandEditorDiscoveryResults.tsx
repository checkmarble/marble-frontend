import { type AstNode, type DataType } from '@app-builder/models';
import {
  getOperandTypeIcon,
  getOperandTypeTKey,
  type OperandType,
} from '@app-builder/models/operand-type';
import * as Ariakit from '@ariakit/react';
import clsx from 'clsx';
import { Trans, useTranslation } from 'react-i18next';
import {
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuPopover,
  SubMenuButton,
  SubMenuRoot,
} from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

import { useOperandEditorActions } from './OperandEditorProvider';
import { OperandOption } from './OperandMenuItem';

interface OperandEditorDiscoveryResultsProps {
  discoveryResults: {
    enumOptions: {
      astNode: AstNode;
      displayName: string;
      dataType: DataType;
      operandType: OperandType;
    }[];
    fieldOptions: [
      string,
      {
        astNode: AstNode;
        displayName: string;
        dataType: DataType;
        operandType: OperandType;
      }[],
    ][];
    customListOptions: {
      astNode: AstNode;
      displayName: string;
      dataType: DataType;
      operandType: OperandType;
    }[];
    functionOptions: {
      astNode: AstNode;
      displayName: string;
      dataType: DataType;
      operandType: OperandType;
    }[];
    modelingOptions: {
      astNode: AstNode;
      displayName: string;
      dataType: DataType;
      operandType: OperandType;
    }[];
  };
}

export function OperandEditorDiscoveryResults({
  discoveryResults: {
    enumOptions,
    fieldOptions,
    customListOptions,
    functionOptions,
    modelingOptions,
  },
}: OperandEditorDiscoveryResultsProps) {
  const { onOptionClick } = useOperandEditorActions();

  return (
    <>
      {enumOptions.length > 0 ? (
        <Submenu options={enumOptions} onClick={onOptionClick}>
          <OperandDiscoveryTitle
            operandType="Enum"
            count={enumOptions.length}
          />
        </Submenu>
      ) : null}

      {fieldOptions.length > 0 ? (
        <MenuGroup className="flex w-full flex-col">
          <OperandDiscoveryTitle
            operandType="Field"
            count={fieldOptions.reduce(
              (acc, [_, subOptions]) => acc + subOptions.length,
              0,
            )}
            className="min-h-10 p-2"
            renderLabel={<MenuGroupLabel render={<span />} />}
          />
          {fieldOptions.map(([path, subOptions]) => (
            <Submenu key={path} options={subOptions} onClick={onOptionClick}>
              <FieldByPathLabel path={path} count={subOptions.length} />
            </Submenu>
          ))}
        </MenuGroup>
      ) : null}

      {customListOptions.length > 0 ? (
        <Submenu options={customListOptions} onClick={onOptionClick}>
          <OperandDiscoveryTitle
            operandType="CustomList"
            count={customListOptions.length}
          />
        </Submenu>
      ) : null}

      {functionOptions.length > 0 ? (
        <Submenu options={functionOptions} onClick={onOptionClick}>
          <OperandDiscoveryTitle
            operandType="Function"
            count={functionOptions.length}
          />
        </Submenu>
      ) : null}

      {modelingOptions.length > 0 ? (
        <Submenu options={modelingOptions} onClick={onOptionClick}>
          <OperandDiscoveryTitle
            operandType="Modeling"
            count={modelingOptions.length}
          />
        </Submenu>
      ) : null}
    </>
  );
}

function Submenu({
  children,
  options,
  onClick,
}: {
  children: React.ReactNode;
  options: {
    astNode: AstNode;
    displayName: string;
    dataType: DataType;
    operandType: OperandType;
    icon?: IconName;
  }[];
  onClick: (option: AstNode) => void;
}) {
  const { i18n } = useTranslation();
  return (
    <SubMenuRoot rtl={i18n.dir() === 'rtl'}>
      <SubMenuButton className="data-[active-item]:bg-purple-98 flex min-h-10 scroll-mb-2 scroll-mt-12 flex-row items-center justify-between gap-2 rounded-sm p-2 outline-none">
        {children}
        <Icon
          aria-hidden="true"
          icon="arrow-right"
          className="size-5 shrink-0 rtl:rotate-180"
        />
      </SubMenuButton>
      <MenuPopover className="max-h-64 w-96 flex-col" gutter={16}>
        <MenuContent>
          <div className="scrollbar-gutter-stable flex flex-col gap-2 overflow-y-auto p-2 pe-[calc(0.5rem-var(--scrollbar-width))]">
            {options.map((option) => (
              <OperandOption
                {...option}
                key={option.displayName}
                onClick={() => onClick(option.astNode)}
              />
            ))}
          </div>
        </MenuContent>
      </MenuPopover>
    </SubMenuRoot>
  );
}

function OperandDiscoveryTitle({
  operandType,
  count,
  className,
  renderLabel,
}: {
  operandType: OperandType;
  count: number;
  className?: string;
  renderLabel?: Ariakit.RoleProps['render'];
}) {
  const { t } = useTranslation('scenarios');
  const icon = getOperandTypeIcon(operandType);
  const tKey = getOperandTypeTKey(operandType);

  return (
    <div
      className={clsx(
        'flex select-none flex-row items-center gap-1',
        className,
      )}
    >
      {icon ? (
        <Icon
          aria-hidden="true"
          className="text-purple-65 size-5 shrink-0"
          icon={icon}
        />
      ) : null}
      {tKey ? (
        <span className="text-grey-00 text-m flex flex-1 flex-row items-baseline gap-1 break-all">
          <Ariakit.Role.span className="font-semibold" render={renderLabel}>
            {t(tKey, {
              count: count,
            })}
          </Ariakit.Role.span>
          <span className="text-grey-80 text-xs font-medium">{count}</span>
        </span>
      ) : null}
    </div>
  );
}

function FieldByPathLabel({ path, count }: { path: string; count: number }) {
  const { t } = useTranslation('scenarios');

  return (
    <span className="text-grey-00 text-s flex select-none flex-row items-baseline gap-1 break-all pl-9">
      <Trans
        t={t}
        i18nKey="edit_operand.operator_discovery.from"
        components={{
          Path: <span className="font-semibold" />,
        }}
        values={{
          path,
        }}
      />
      <span className="text-grey-80 text-xs font-medium">{count}</span>
    </span>
  );
}
