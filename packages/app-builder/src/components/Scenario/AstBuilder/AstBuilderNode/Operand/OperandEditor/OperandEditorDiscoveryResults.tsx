import {
  type DataType,
  isDatabaseAccess,
  isPayload,
  type LabelledAst,
} from '@app-builder/models';
import { type AstBuilder } from '@app-builder/services/editor/ast-editor';
import * as Ariakit from '@ariakit/react';
import clsx from 'clsx';
import type * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import {
  MenuButton,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuPopover,
  MenuRoot,
  ScrollAreaV2,
} from 'ui-design-system';
import { Icon } from 'ui-icons';

import { getOperatorTypeIcon, getOperatorTypeTKey } from '../utils';
import { OperandOption } from './OperandMenuItem';

interface OperandEditorDiscoveryResultsProps {
  builder: AstBuilder;
  options: LabelledAst[];
  onSelect: (option: LabelledAst) => void;
}

interface LeafGroup {
  id: string;
  label: React.ReactNode;
  options: {
    id: string;
    label: React.ReactNode;
    dataType: DataType;
    option: LabelledAst;
    onSelect: () => void;
  }[];
}

interface NodeGroup {
  id: string;
  label: React.ReactNode;
  subGroups: LeafGroup[];
}

type Group = LeafGroup | NodeGroup;

export function renderGroup(group: Group) {
  const isLeafGroup = 'options' in group;

  if (isLeafGroup) {
    return (
      <MenuRoot key={group.id}>
        <MenuButton className="data-[active-item]:bg-purple-05 flex min-h-10 scroll-mb-2 scroll-mt-12 flex-row items-center justify-between gap-2 rounded-sm p-2 outline-none">
          {group.label}
          <Icon
            aria-hidden="true"
            icon="arrow-right"
            className="size-5 shrink-0"
          />
        </MenuButton>
        <MenuPopover className="max-h-64 w-64 flex-col" gutter={16}>
          <MenuContent>
            <ScrollAreaV2 type="auto">
              <div className="flex flex-col gap-2 p-2">
                {group.options.map((option) => (
                  <OperandOption
                    key={option.id}
                    dataType={option.dataType}
                    label={option.label}
                    option={option.option}
                    onSelect={option.onSelect}
                  />
                ))}
              </div>
            </ScrollAreaV2>
          </MenuContent>
        </MenuPopover>
      </MenuRoot>
    );
  }

  return (
    <MenuGroup key={group.id} className="flex w-full flex-col">
      {group.label}
      {group.subGroups.map((subGroup) => renderGroup(subGroup))}
    </MenuGroup>
  );
}

export function OperandEditorDiscoveryResults({
  builder,
  options,
  onSelect,
}: OperandEditorDiscoveryResultsProps) {
  const optionsGroups = R.pipe(
    options,
    R.groupBy.strict((option) => option.operandType),
  );

  const groups = R.pipe(
    defaultDiscoveryResultsConfig,
    R.toPairs.strict(),
    R.map(([operandType, getter]) => {
      const options = optionsGroups[operandType] ?? [];
      return getter(options, {
        onSelect,
        triggerObjectTableName: builder.input.triggerObjectTable.name,
      });
    }),
    R.filter(R.isDefined.strict),
  );

  return groups.map((group) => renderGroup(group));
}

type GroupGetter = (
  options: LabelledAst[],
  config: {
    onSelect: (option: LabelledAst) => void;
    triggerObjectTableName: string;
  },
) => Group | undefined;

function leafGroupGetter(operandType: LabelledAst['operandType']): GroupGetter {
  return (options, { onSelect }): LeafGroup | undefined => {
    const count = options.length;

    if (count === 0) return undefined;

    return {
      id: operandType,
      label: <OperandDiscoveryTitle operandType={operandType} count={count} />,
      options: options.map((option) => ({
        id: option.name,
        label: option.name,
        dataType: option.dataType,
        option,
        onSelect: () => onSelect(option),
      })),
    };
  };
}

const getFieldGroup: GroupGetter = (
  options,
  { onSelect, triggerObjectTableName },
) => {
  const count = options.length;
  if (count === 0) return undefined;

  const fieldByPathOptions = R.pipe(
    options,
    R.groupBy.strict((option) => {
      const { astNode } = option;
      if (isPayload(astNode)) {
        return triggerObjectTableName;
      }
      if (isDatabaseAccess(astNode)) {
        return [
          astNode.namedChildren.tableName.constant,
          ...astNode.namedChildren.path.constant,
        ].join('.');
      }
    }),
    R.mapValues((value) => R.sortBy(value, (o) => o.name)),
    R.toPairs(),
  );

  return {
    id: 'Field',
    label: (
      <OperandDiscoveryTitle
        operandType="Field"
        count={count}
        className="min-h-10 p-2"
        renderLabel={<MenuGroupLabel />}
      />
    ),
    subGroups: fieldByPathOptions.map(([path, options]) => ({
      id: path,
      label: <FieldByPathLabel path={path} count={options.length} />,
      count: options.length,
      options: options.map((option) => ({
        id: option.name,
        label: option.name,
        dataType: option.dataType,
        option,
        onSelect: () => onSelect(option),
      })),
    })),
  };
};

function OperandDiscoveryTitle({
  operandType,
  count,
  className,
  renderLabel,
}: {
  operandType: LabelledAst['operandType'];
  count: number;
  className?: string;
  renderLabel?: Ariakit.RoleProps['render'];
}) {
  const { t } = useTranslation('scenarios');
  const icon = getOperatorTypeIcon(operandType);
  const tKey = getOperatorTypeTKey(operandType);

  return (
    <div
      className={clsx(
        'flex select-none flex-row items-center gap-1 truncate',
        className,
      )}
    >
      {icon ? (
        <Icon
          aria-hidden="true"
          className="size-5 shrink-0 text-purple-100"
          icon={icon}
        />
      ) : null}
      {tKey ? (
        <span className="flex w-full items-baseline gap-1 truncate">
          <Ariakit.Role.span
            className="text-grey-100 text-m flex items-baseline truncate whitespace-pre font-semibold"
            render={renderLabel}
          >
            {t(tKey, {
              count: count,
            })}
          </Ariakit.Role.span>
          <span className="text-grey-25 text-xs font-medium">{count}</span>
        </span>
      ) : null}
    </div>
  );
}

function FieldByPathLabel({ path, count }: { path: string; count: number }) {
  const { t } = useTranslation('scenarios');

  return (
    <div className="flex select-none flex-row items-baseline gap-1 truncate pl-9">
      <span className="text-grey-100 text-s flex items-baseline truncate whitespace-pre">
        <Trans
          t={t}
          i18nKey="edit_operand.operator_discovery.from"
          components={{
            Path: <span className="truncate font-semibold" />,
          }}
          values={{
            path,
          }}
        />
      </span>
      <span className="text-grey-25 text-xs font-medium">{count}</span>
    </div>
  );
}

/**
 * Organize the options into groups and subgroups
 * - Key order is used to determine the order of the groups in the UI
 * - GroupGetter is used to display the options in each group
 */
type OperandEditorDiscoveryResultsConfig = Partial<
  Record<LabelledAst['operandType'], GroupGetter>
>;

export const defaultDiscoveryResultsConfig: OperandEditorDiscoveryResultsConfig =
  {
    Enum: leafGroupGetter('Enum'),
    Field: getFieldGroup,
    CustomList: leafGroupGetter('CustomList'),
    Function: leafGroupGetter('Function'),
  };
