import {
  DatabaseAccessEditableAstNode,
  type EditableAstNode,
  getOperandTypeIcon,
  getOperandTypeTKey,
  type OperandType,
  PayloadAccessorsEditableAstNode,
} from '@app-builder/models/editable-ast-node';
import * as Ariakit from '@ariakit/react';
import clsx from 'clsx';
import { type FunctionComponent, useMemo } from 'react';
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

import { OperandOption } from './OperandMenuItem';

type GroupGetter = FunctionComponent<{
  operandType: OperandType;
  options: EditableAstNode[];
  searchValue: string;
  onClick: (option: EditableAstNode) => void;
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
  options: EditableAstNode[];
  searchValue: string;
  onClick: (option: EditableAstNode) => void;
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
      R.groupBy.strict((option) => option.operandType),
    );
  }, [options]);

  return R.pipe(
    discoveryResultsConfig,
    R.toPairs.strict(),
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
  options: EditableAstNode[];
  onClick: (option: EditableAstNode) => void;
}) {
  return (
    <MenuRoot>
      <MenuButton className="data-[active-item]:bg-purple-05 flex min-h-10 scroll-mb-2 scroll-mt-12 flex-row items-center justify-between gap-2 rounded-sm p-2 outline-none">
        {children}
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
              {options.map((option) => (
                <OperandOption
                  key={option.displayName}
                  editableAstNode={option}
                  searchValue={searchValue}
                  onClick={() => onClick(option)}
                />
              ))}
            </div>
          </ScrollAreaV2>
        </MenuContent>
      </MenuPopover>
    </MenuRoot>
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
  const fieldByPathOptions = useMemo(() => {
    return R.pipe(
      options,
      R.groupBy.strict((option) => {
        if (
          option instanceof PayloadAccessorsEditableAstNode ||
          option instanceof DatabaseAccessEditableAstNode
        ) {
          return option.getFieldGroupName();
        }
      }),
      R.mapValues((value) => R.sortBy(value, (o) => o.displayName)),
      R.toPairs(),
    );
  }, [options]);

  const count = options.length;
  if (count === 0) return null;

  return (
    <MenuGroup className="flex w-full flex-col">
      <OperandDiscoveryTitle
        operandType={operandType}
        count={count}
        className="min-h-10 p-2"
        renderLabel={<MenuGroupLabel />}
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

const defaultDiscoveryResultsConfig: OperandEditorDiscoveryResultsConfig = {
  Enum: FlatGroupGetter,
  Field: FieldGroupGetter,
  CustomList: FlatGroupGetter,
  Function: FlatGroupGetter,
};
