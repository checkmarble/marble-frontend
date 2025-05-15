import type { AstNode } from '@app-builder/models';
import {
  getOperandTypeIcon,
  getOperandTypeTKey,
  type OperandType,
} from '@app-builder/models/operand-type';
import { useFormatLanguage } from '@app-builder/utils/format';
import { AstBuilderDataSharpFactory } from '@ast-builder/Provider';
import clsx from 'clsx';
import { type ReactNode, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { EditionOperandSharpFactory } from '../EditionOperand';
import { type EnrichedMenuOption, getOptionDisplayName, groupByOperandType } from '../helpers';
import { MenuOption } from './MenuOption';
import type { SmartMenuListProps } from './types';

export function DiscoveryList({ onSelect }: SmartMenuListProps) {
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const options = EditionOperandSharpFactory.useSharp().computed.filteredOptions.value;
  const enumValues = EditionOperandSharpFactory.useSharp().value.enumValues;
  const triggerObjectTable = dataSharp.computed.triggerObjectTable;

  const groupedOptions = useMemo(() => {
    return groupByOperandType(options, {
      enumValues,
      triggerObjectTable: triggerObjectTable.value,
    });
  }, [triggerObjectTable.value, enumValues, options]);

  const { enumOptions, fieldOptions, functionOptions, modelingOptions, customListOptions } =
    groupedOptions;
  const subMenus = [
    { options: customListOptions, type: 'CustomList' },
    { options: functionOptions, type: 'Function' },
    { options: modelingOptions, type: 'Modeling' },
  ] as const;

  return (
    <MenuCommand.List>
      <div className="flex flex-col gap-2">
        {enumOptions.length > 0 ? (
          <SubMenu
            onSelect={onSelect}
            trigger={<MenuTitle operandType="Enum" count={enumOptions.length} />}
            options={enumOptions}
          />
        ) : null}

        {fieldOptions.length > 0 ? (
          <MenuCommand.Group
            forceMount
            heading={
              <MenuTitle
                operandType="Field"
                count={fieldOptions.reduce((acc, [_, subOpts]) => acc + subOpts.length, 0)}
                className="min-h-10 p-2"
              />
            }
          >
            {fieldOptions.map(([_path, options]) => {
              const path = _path.split('.');
              const label = path.pop() ?? '';

              return (
                <SubMenu
                  key={_path}
                  value={_path}
                  onSelect={onSelect}
                  trigger={<SubMenuFieldTrigger {...{ label, depth: path.length, options }} />}
                  options={options}
                />
              );
            })}
          </MenuCommand.Group>
        ) : null}

        {subMenus.map((subMenu) =>
          subMenu.options.length > 0 ? (
            <SubMenu
              key={subMenu.type}
              onSelect={onSelect}
              trigger={<MenuTitle operandType={subMenu.type} count={subMenu.options.length} />}
              options={subMenu.options}
            />
          ) : null,
        )}
      </div>
    </MenuCommand.List>
  );
}

type SubMenuFieldTriggerProps = {
  options: EnrichedMenuOption[];
  label: string;
  depth: number;
};
function SubMenuFieldTrigger(props: SubMenuFieldTriggerProps) {
  const { t } = useTranslation('scenarios');
  const padding = 24 + Math.max(props.depth - 1, 0) * 20 + (props.depth > 0 ? 8 : 0); // p-6 + (p-5 * depth) + p-2

  return (
    <>
      <span
        className="text-grey-00 text-s flex select-none flex-row items-baseline gap-1 break-all"
        style={{ paddingLeft: `${padding}px` }}
      >
        {props.depth === 0 ? (
          <span className="line-clamp-1">
            <Trans
              t={t}
              i18nKey="edit_operand.operator_discovery.from"
              components={{
                Path: <span className="font-semibold" />,
              }}
              values={{ path: props.label }}
            />
          </span>
        ) : (
          <span className="flex items-baseline gap-1">
            <Icon
              icon="subdirectory-arrow-right"
              className="text-grey-80 group-aria-selected/menu-item:text-grey-00 size-4 shrink-0 self-center"
            />
            <span className="line-clamp-1 shrink font-semibold">{props.label}</span>
          </span>
        )}
        <span className="text-grey-80 shrink-0 text-xs font-medium">{props.options.length}</span>
      </span>
    </>
  );
}

type MenuTitleProps = {
  operandType: OperandType;
  count: number;
  className?: string;
};
function MenuTitle({ operandType, count, className }: MenuTitleProps) {
  const { t } = useTranslation('scenarios');
  const icon = getOperandTypeIcon(operandType);
  const tKey = getOperandTypeTKey(operandType);

  return (
    <div className={clsx('flex grow select-none flex-row items-center gap-1', className)}>
      {icon ? (
        <Icon aria-hidden="true" className="text-purple-65 size-5 shrink-0" icon={icon} />
      ) : null}
      {tKey ? (
        <span className="text-grey-00 text-m flex flex-1 flex-row items-baseline gap-1 break-all">
          <span className="font-semibold">{t(tKey, { count: count })}</span>
          <span className="text-grey-80 text-xs font-medium">{count}</span>
        </span>
      ) : null}
    </div>
  );
}

type SubMenuProps = {
  value?: string;
  trigger: ReactNode;
  options: EnrichedMenuOption[];
  onSelect: (astNode: AstNode) => void;
};
function SubMenu({ value, trigger, options, onSelect }: SubMenuProps) {
  const { t } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();
  const customLists = AstBuilderDataSharpFactory.useSharp().value.data.customLists;

  return (
    <MenuCommand.SubMenu value={value} forceMount trigger={trigger} className="w-96">
      <MenuCommand.List>
        <MenuCommand.Group>
          {options.map((option) => {
            const displayName = getOptionDisplayName(option, {
              customLists,
              language,
              t,
            });

            return <MenuOption key={displayName} option={option} onSelect={onSelect} />;
          })}
        </MenuCommand.Group>
      </MenuCommand.List>
    </MenuCommand.SubMenu>
  );
}
