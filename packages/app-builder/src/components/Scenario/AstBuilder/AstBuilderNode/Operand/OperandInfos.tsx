import {
  type DataType,
  getDataTypeIcon,
  getDataTypeTKey,
} from '@app-builder/models';
import {
  adaptEditableAstNode,
  AggregatorEditableAstNode,
  ConstantEditableAstNode,
  CustomListEditableAstNode,
  DatabaseAccessEditableAstNode,
  type EditableAstNode,
  getOperandTypeIcon,
  getOperandTypeTKey,
  type OperandType,
  PayloadAccessorsEditableAstNode,
  TimeAddEditableAstNode,
  TimeNowEditableAstNode,
  UndefinedEditableAstNode,
} from '@app-builder/models/editable-ast-node';
import { type OperatorFunction } from '@app-builder/models/editable-operators';
import * as Ariakit from '@ariakit/react';
import { Fragment } from 'react/jsx-runtime';
import { useTranslation } from 'react-i18next';
import { assertNever } from 'typescript-utils';
import { ScrollAreaV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { LogicalOperatorLabel } from '../../RootAstBuilderNode/LogicalOperator';
import { Operator } from '../Operator';
import { OperandLabel } from './OperandLabel';

const MAX_ENUM_VALUES = 50;

interface OperandInfosProps {
  className?: string;
  gutter?: number;
  shift?: number;
  editableAstNode: EditableAstNode;
}

export function OperandInfos({
  className,
  gutter,
  shift,
  editableAstNode,
}: OperandInfosProps) {
  return (
    <Ariakit.HovercardProvider
      showTimeout={0}
      hideTimeout={0}
      placement="right-start"
    >
      <Ariakit.HovercardAnchor tabIndex={-1}>
        <Icon icon="tip" className={className} />
      </Ariakit.HovercardAnchor>
      <Ariakit.Hovercard
        unmountOnHide
        gutter={gutter}
        shift={shift}
        portal
        className="bg-grey-00 border-grey-10 flex max-h-[400px] overflow-y-auto overflow-x-hidden rounded border shadow-md"
      >
        <ScrollAreaV2>
          <div className="flex flex-col gap-2 p-4">
            <div className="flex flex-col gap-1">
              <TypeInfos
                operandType={editableAstNode.operandType}
                dataType={editableAstNode.dataType}
              />
              <p className="text-grey-100 text-s text-ellipsis hyphens-auto font-normal">
                {editableAstNode.displayName}
              </p>
            </div>
            <OperandDescription editableAstNode={editableAstNode} />
          </div>
        </ScrollAreaV2>
      </Ariakit.Hovercard>
    </Ariakit.HovercardProvider>
  );
}

function TypeInfos({
  operandType,
  dataType,
}: {
  operandType: OperandType;
  dataType: DataType;
}) {
  const { t } = useTranslation(['scenarios']);
  const typeInfos = [
    {
      icon: getOperandTypeIcon(operandType),
      tKey: getOperandTypeTKey(operandType),
    },
    {
      icon: getDataTypeIcon(dataType),
      tKey: getDataTypeTKey(dataType),
    },
  ];
  if (typeInfos.filter(({ tKey }) => !!tKey).length === 0) return null;

  return (
    <div className="flex flex-row gap-2">
      {typeInfos.map(({ icon, tKey }) => {
        if (!tKey) return null;
        return (
          <span
            key={tKey}
            className="inline-flex items-center gap-[2px] text-xs font-normal text-purple-50"
          >
            {icon ? <Icon icon={icon} className="size-3" /> : null}
            {t(tKey, { count: 1 })}
          </span>
        );
      })}
    </div>
  );
}

function OperandDescription({
  editableAstNode,
}: {
  editableAstNode: EditableAstNode;
}) {
  const { t } = useTranslation(['scenarios']);

  if (editableAstNode instanceof AggregatorEditableAstNode) {
    return <AggregatorDescription editableAstNode={editableAstNode} />;
  }
  if (editableAstNode instanceof CustomListEditableAstNode) {
    const { description } = editableAstNode.customList;
    return <Description description={description} />;
  }
  if (
    editableAstNode instanceof DatabaseAccessEditableAstNode ||
    editableAstNode instanceof PayloadAccessorsEditableAstNode
  ) {
    return <DataAccessorDescription editableAstNode={editableAstNode} />;
  }
  if (editableAstNode instanceof TimeNowEditableAstNode) {
    return (
      <Description description={t('scenarios:edit_date.now.description')} />
    );
  }
  if (
    editableAstNode instanceof ConstantEditableAstNode ||
    editableAstNode instanceof UndefinedEditableAstNode ||
    editableAstNode instanceof TimeAddEditableAstNode
  ) {
    return null;
  }

  assertNever('[OperandDescription] unknown editableAstNode:', editableAstNode);
}

function Description({ description }: { description: string }) {
  if (!description) return null;
  return (
    <p className="text-grey-50 max-w-[300px] text-xs font-normal first-letter:capitalize">
      {description}
    </p>
  );
}

function DataAccessorDescription({
  editableAstNode,
}: {
  editableAstNode:
    | PayloadAccessorsEditableAstNode
    | DatabaseAccessEditableAstNode;
}) {
  const { t } = useTranslation(['scenarios']);
  const { description, values, isEnum } = editableAstNode.field;

  return (
    <>
      <Description description={description} />
      {isEnum && values && values.length > 0 ? (
        <div className="flex max-w-[300px] flex-col gap-1">
          <p className="text-grey-50 text-s">{t('scenarios:enum_options')}</p>
          <ul className="flex flex-col">
            {values
              .slice(0, MAX_ENUM_VALUES)
              .sort()
              .map((value) => {
                return (
                  <li
                    key={value}
                    className="text-grey-50 truncate text-xs font-normal"
                  >
                    {value}
                  </li>
                );
              })}
            {values.length > MAX_ENUM_VALUES ? (
              <li className="text-grey-50 truncate text-xs font-normal">...</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </>
  );
}

function AggregatorDescription({
  editableAstNode,
}: {
  editableAstNode: AggregatorEditableAstNode;
}) {
  const { t } = useTranslation(['scenarios']);
  const { aggregator, tableName, fieldName, filters } =
    editableAstNode.astNode.namedChildren;
  if (
    !tableName.constant &&
    !fieldName.constant &&
    filters.children.length === 0
  )
    return null;

  const aggregatedFieldName = `${tableName.constant}.${fieldName.constant}`;

  return (
    <div className="grid grid-cols-[min-content_1fr] items-center gap-2">
      <span className="text-center font-bold text-purple-100">
        {aggregator.constant}
      </span>
      <span className="font-bold">{aggregatedFieldName}</span>
      {filters.children.map((filter, index) => {
        const { operator, fieldName, value } = filter.namedChildren;
        const valueEditableAstNode = adaptEditableAstNode(t, value, {
          dataModel: editableAstNode.dataModel,
          triggerObjectTable: editableAstNode.triggerObjectTable,
          customLists: editableAstNode.customLists,
          enumOptions: [],
        });
        if (!valueEditableAstNode) return null;
        return (
          <Fragment key={`filter_${index}`}>
            <LogicalOperatorLabel
              operator={index === 0 ? 'where' : 'and'}
              type="text"
            />
            <div className="flex items-center gap-1">
              {/* TODO: replace with OperandLable for consistency */}
              <p className="bg-grey-02 whitespace-nowrap p-2 text-right">
                {fieldName?.constant ?? '...'}
              </p>
              <Operator
                value={operator?.constant as OperatorFunction}
                setValue={() => {}}
                operators={[operator?.constant as OperatorFunction]}
                viewOnly
              />
              <OperandLabel
                editableAstNode={valueEditableAstNode}
                type="viewer"
              />
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
