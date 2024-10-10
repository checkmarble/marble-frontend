import {
  type AstNode,
  type DataType,
  isDatabaseAccess,
  isPayload,
} from '@app-builder/models';
import {
  getOperandTypeIcon,
  getOperandTypeTKey,
  type OperandType,
} from '@app-builder/models/operand-type';
import { useTriggerObjectTable } from '@app-builder/services/editor/options';
import * as Ariakit from '@ariakit/react';
import clsx from 'clsx';
import { type FunctionComponent, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import {
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuPopover,
  SubMenuButton,
  SubMenuRoot,
} from 'ui-design-system';
import { Icon } from 'ui-icons';

import { OperandOption } from './OperandMenuItem';

type GroupGetter = FunctionComponent<{
  operandType: OperandType;
  options: {
    astNode: AstNode;
    displayName: string;
    dataType: DataType;
    operandType: OperandType;
  }[];
  searchValue: string;
  onClick: (option: AstNode) => void;
}>;

/**
 * Organize the options into groups and subgroups
 * - Key order is used to determine the order of the groups in the UI
 * - GroupGetter is used to display the options in each group
 */
type OperandEditorDiscoveryResultsConfig = Partial<
  Record<OperandType, GroupGetter>
>;

interface OperandEditorDiscoveryResultsProps {
  options: {
    astNode: AstNode;
    displayName: string;
    dataType: DataType;
    operandType: OperandType;
  }[];
  searchValue: string;
  onClick: (option: AstNode) => void;
  discoveryResultsConfig?: OperandEditorDiscoveryResultsConfig;
}

export function OperandEditorDiscoveryResults({
  options,
  searchValue,
  onClick,
  discoveryResultsConfig = defaultDiscoveryResultsConfig,
}: OperandEditorDiscoveryResultsProps) {
  const optionsGroups = useMemo(() => {
    return R.pipe(
      options,
      R.groupBy((option) => option.operandType),
    );
  }, [options]);

  return R.pipe(
    discoveryResultsConfig,
    R.entries(),
    R.map(([operandType, Getter]) => {
      return (
        <Getter
          key={operandType}
          operandType={operandType}
          options={optionsGroups[operandType] ?? []}
          searchValue={searchValue}
          onClick={onClick}
        />
      );
    }),
  );
}

function Submenu({
  searchValue,
  children,
  options,
  onClick,
}: {
  searchValue: string;
  children: React.ReactNode;
  options: {
    astNode: AstNode;
    displayName: string;
    dataType: DataType;
    operandType: OperandType;
  }[];
  onClick: (option: AstNode) => void;
}) {
  return (
    <SubMenuRoot>
      <SubMenuButton className="data-[active-item]:bg-purple-05 flex min-h-10 scroll-mb-2 scroll-mt-12 flex-row items-center justify-between gap-2 rounded-sm p-2 outline-none">
        {children}
        <Icon
          aria-hidden="true"
          icon="arrow-right"
          className="size-5 shrink-0"
        />
      </SubMenuButton>
      <MenuPopover className="max-h-64 w-96 flex-col" gutter={16}>
        <MenuContent>
          <div className="scrollbar-gutter-stable flex flex-col gap-2 overflow-y-auto p-2 pr-[calc(0.5rem-var(--scrollbar-width))]">
            {options.map((option) => (
              <OperandOption
                key={option.displayName}
                astNode={option.astNode}
                dataType={option.dataType}
                operandType={option.operandType}
                displayName={option.displayName}
                searchValue={searchValue}
                onClick={() => onClick(option.astNode)}
              />
            ))}
          </div>
        </MenuContent>
      </MenuPopover>
    </SubMenuRoot>
  );
}

const FlatGroupGetter: GroupGetter = ({
  operandType,
  searchValue,
  options,
  onClick,
}) => {
  const count = options.length;

  if (count === 0) return null;

  return (
    <Submenu options={options} onClick={onClick} searchValue={searchValue}>
      <OperandDiscoveryTitle operandType={operandType} count={count} />
    </Submenu>
  );
};

const FieldGroupGetter: GroupGetter = ({
  operandType,
  searchValue,
  options,
  onClick,
}) => {
  const triggerObjectTable = useTriggerObjectTable();
  const fieldByPathOptions = useMemo(() => {
    return R.pipe(
      options,
      R.groupBy((option) => {
        if (isDatabaseAccess(option.astNode)) {
          const { path, tableName } = option.astNode.namedChildren;
          return [tableName.constant, ...path.constant].join('.');
        }
        if (isPayload(option.astNode)) {
          return triggerObjectTable.name;
        }
      }),
      R.mapValues((value) => R.sortBy(value, (o) => o.displayName)),
      R.entries(),
    );
  }, [options, triggerObjectTable.name]);

  const count = options.length;
  if (count === 0) return null;

  return (
    <MenuGroup className="flex w-full flex-col">
      <OperandDiscoveryTitle
        operandType={operandType}
        count={count}
        className="min-h-10 p-2"
        renderLabel={<MenuGroupLabel render={<span />} />}
      />
      {fieldByPathOptions.map(([path, subOptions]) => (
        <Submenu
          key={path}
          searchValue={searchValue}
          options={subOptions}
          onClick={onClick}
        >
          <FieldByPathLabel path={path} count={subOptions.length} />
        </Submenu>
      ))}
    </MenuGroup>
  );
};

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
          className="size-5 shrink-0 text-purple-100"
          icon={icon}
        />
      ) : null}
      {tKey ? (
        <span className="text-grey-100 text-m flex-1 items-baseline break-all">
          <Ariakit.Role.span className="font-semibold" render={renderLabel}>
            {t(tKey, {
              count: count,
            })}
          </Ariakit.Role.span>
          <span className="text-grey-25 text-xs font-medium">{` ${count}`}</span>
        </span>
      ) : null}
    </div>
  );
}

function FieldByPathLabel({ path, count }: { path: string; count: number }) {
  const { t } = useTranslation('scenarios');

  return (
    <span className="text-grey-100 text-s select-none items-baseline break-all pl-9">
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
      <span className="text-grey-25 text-xs font-medium">{` ${count}`}</span>
    </span>
  );
}

const defaultDiscoveryResultsConfig: OperandEditorDiscoveryResultsConfig = {
  Enum: FlatGroupGetter,
  Field: FieldGroupGetter,
  CustomList: FlatGroupGetter,
  Function: FlatGroupGetter,
};
