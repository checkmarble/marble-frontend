import {
  type DataModel,
  type DataType,
  getDataTypeIcon,
  getDataTypeTKey,
  type IdLessAstNode,
  type TableModel,
} from '@app-builder/models';
import {
  type AggregationAstNode,
  isAggregation,
  isUnaryAggregationFilter,
} from '@app-builder/models/astNode/aggregation';
import {
  type CustomListAccessAstNode,
  isCustomListAccess,
} from '@app-builder/models/astNode/custom-list';
import {
  type DataAccessorAstNode,
  isDataAccessorAstNode,
} from '@app-builder/models/astNode/data-accessor';
import { isTimeAdd } from '@app-builder/models/astNode/time';
import { type CustomList } from '@app-builder/models/custom-list';
import {
  getOperandTypeIcon,
  getOperandTypeTKey,
  type OperandType,
} from '@app-builder/models/operand-type';
import { getDataAccessorAstNodeField } from '@app-builder/services/ast-node/getDataAccessorAstNodeField';
import {
  HoverCard,
  HoverCardContent,
  HoverCardPortal,
  HoverCardTrigger,
} from '@radix-ui/react-hover-card';
import clsx from 'clsx';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

import { AstBuilderDataSharpFactory } from './Provider';
import { LogicalOperatorLabel } from './styles/LogicalOperatorLabel';
import { ViewingAstBuilderOperand } from './viewing/ViewingOperand';
import { ViewingOperator } from './viewing/ViewingOperator';

const MAX_ENUM_VALUES = 50;

type OperandInfosProps = {
  node: IdLessAstNode;
  dataType: DataType;
  operandType: OperandType;
  displayName: string;
};

const contentClassnames = clsx([
  'flex flex-col w-full flex-1 overflow-hidden',
  'bg-grey-100 border-grey-90 rounded border shadow-md outline-none',
]);

export function OperandInfos(props: OperandInfosProps) {
  return (
    <HoverCard openDelay={50} closeDelay={200}>
      <HoverCardTrigger asChild>
        <Icon
          icon="tip"
          className="group-hover:hover:text-purple-65 group-hover:text-purple-82 data-[state=open]:text-purple-65 size-5 shrink-0 text-transparent"
        />
      </HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent
          side="right"
          align="start"
          sideOffset={20}
          alignOffset={-8}
          className={contentClassnames}
        >
          <div className="bg-grey-100 flex flex-col gap-2 overflow-auto p-4">
            <div className="flex flex-col gap-1">
              <TypeInfos operandType={props.operandType} dataType={props.dataType} />
              <p className="text-grey-00 text-s text-ellipsis hyphens-auto font-normal">
                {props.displayName}
              </p>
            </div>
            <OperandDescription node={props.node} />
          </div>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  );
}

type TypeInfosProps = Pick<OperandInfosProps, 'operandType' | 'dataType'>;
function TypeInfos({ operandType, dataType }: TypeInfosProps) {
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
            className="text-purple-82 inline-flex items-center gap-[2px] text-xs font-normal"
          >
            {icon ? <Icon icon={icon} className="size-3" /> : null}
            {t(tKey, { count: 1 })}
          </span>
        );
      })}
    </div>
  );
}

type OperandDescriptionProps = Pick<OperandInfosProps, 'node'>;
function OperandDescription({ node }: OperandDescriptionProps) {
  const { t } = useTranslation(['scenarios']);
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const data = dataSharp.select((s) => s.data);

  if (isAggregation(node)) {
    return <AggregatorDescription node={node} />;
  }
  if (isCustomListAccess(node)) {
    return <CustomListAccessDescription node={node} customLists={data.customLists} />;
  }
  if (isDataAccessorAstNode(node)) {
    return (
      <DataAccessorDescription
        node={node}
        dataModel={data.dataModel}
        triggerObjectTable={dataSharp.computed.triggerObjectTable.value}
      />
    );
  }
  if (isTimeAdd(node)) {
    return <Description description={t('scenarios:edit_date.now.description')} />;
  }
}

function Description({ description }: { description: string }) {
  return description ? (
    <p className="text-grey-50 max-w-[300px] text-xs font-normal first-letter:capitalize">
      {description}
    </p>
  ) : null;
}

type AggregatorDescriptionProps = {
  node: IdLessAstNode<AggregationAstNode>;
};
function AggregatorDescription({ node }: AggregatorDescriptionProps) {
  const { aggregator, tableName, fieldName, filters } = node.namedChildren;
  if (!tableName.constant && !fieldName.constant && filters.children.length === 0) return null;

  const aggregatedFieldName = `${tableName.constant}.${fieldName.constant}`;

  return (
    <div className="grid grid-cols-[min-content_1fr] items-center gap-2">
      <span className="text-purple-65 text-center font-bold">{aggregator.constant}</span>
      <span className="font-bold">{aggregatedFieldName}</span>
      {filters.children.map((filter, index) => {
        const { operator, fieldName } = filter.namedChildren;
        return (
          <Fragment key={`filter_${index}`}>
            <LogicalOperatorLabel operator={index === 0 ? 'where' : 'and'} type="text" />
            <div className="flex items-center gap-1">
              {/* TODO: replace with OperandLabel for consistency,
              we may need to change the AggregatorEditableAstNode to register a valid Payload node (instead of the shorthand Constant)
              but it can be cumbersome for api compatibility (notably when getting the astNode from the server)

              Should be stringified as a "payload access" with :
              - a field name (string) = fieldName?.constant
              - a table name (string) = tableName?.constant
              */}
              <p className="bg-grey-98 whitespace-nowrap p-2 text-end">
                {fieldName.constant ?? '...'}
              </p>
              <ViewingOperator operator={operator.constant} isFilter />
              {!isUnaryAggregationFilter(filter) ? (
                <ViewingAstBuilderOperand node={filter.namedChildren.value} />
              ) : null}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

type CustomListAccessDescriptionProps = {
  node: IdLessAstNode<CustomListAccessAstNode>;
  customLists: CustomList[];
};
function CustomListAccessDescription({ node, customLists }: CustomListAccessDescriptionProps) {
  const customList = customLists.find(
    (list) => list.id === node.namedChildren.customListId.constant,
  );
  if (!customList) return null;

  return <Description description={customList.description} />;
}

type DataAccessorDescriptionProps = {
  node: IdLessAstNode<DataAccessorAstNode>;
  dataModel: DataModel;
  triggerObjectTable: TableModel;
};
function DataAccessorDescription({
  node,
  dataModel,
  triggerObjectTable,
}: DataAccessorDescriptionProps) {
  const { t } = useTranslation(['scenarios']);
  const field = getDataAccessorAstNodeField(node, { triggerObjectTable, dataModel });

  return (
    <>
      <Description description={field.description} />
      {field.isEnum && field.values && field.values.length > 0 ? (
        <div className="text-grey-50 flex max-w-[300px] flex-col gap-1">
          <p className="text-s">{t('scenarios:enum_options')}</p>
          <ul className="flex flex-col">
            {field.values
              .slice(0, MAX_ENUM_VALUES)
              .sort()
              .map((value) => (
                <li key={value} className="truncate text-xs font-normal">
                  {value}
                </li>
              ))}
            {field.values.length > MAX_ENUM_VALUES ? (
              <li className="text-xs font-normal">...</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </>
  );
}
