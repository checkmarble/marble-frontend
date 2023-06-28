import {
  type DataFieldNode,
  type DataFieldOperator,
  isDbFieldNode,
  isDbFieldOperator,
} from '@marble-front/operators';
import { Tooltip } from '@marble-front/ui/design-system';

import { Condition } from './Condition';

interface DBFieldProps {
  operator: DataFieldOperator;
  isRoot?: boolean;
}

function format(operator: DataFieldOperator) {
  if (isDbFieldOperator(operator)) {
    const fields = [
      operator.staticData.triggerTableName,
      ...operator.staticData.path,
      operator.staticData.fieldName,
    ];

    return {
      tooltip: fields.join('.'),
      inline: fields.slice(1).join('.'),
    };
  }

  return {
    tooltip: operator.staticData.fieldName,
    inline: operator.staticData.fieldName,
  };
}

export function DataField({ operator, isRoot }: DBFieldProps) {
  const { tooltip, inline } = format(operator);

  return (
    <Condition.Container isRoot={isRoot}>
      <Condition.Item isRoot={isRoot}>
        <Tooltip.Default
          content={
            <span className="font-medium text-purple-100">{tooltip}</span>
          }
        >
          <span
            // Hack to have text-ellipsis truncate beggining of the fields
            dir="rtl"
            className="max-w-[250px] overflow-hidden text-ellipsis font-medium text-purple-100 max-md:max-w-[150px]"
          >
            {inline}
          </span>
        </Tooltip.Default>
      </Condition.Item>
    </Condition.Container>
  );
}

interface NewDBFieldProps {
  node: DataFieldNode;
  isRoot?: boolean;
}

function newFormat(node: DataFieldNode) {
  if (isDbFieldNode(node)) {
    const fields = [
      node.namedChildren.triggerTableName.constant,
      ...node.namedChildren.path.constant,
      node.namedChildren.fieldName.constant,
    ];

    return {
      tooltip: fields.join('.'),
      inline: fields.slice(1).join('.'),
    };
  }

  return {
    tooltip: node.namedChildren.fieldName.constant,
    inline: node.namedChildren.fieldName.constant,
  };
}

export function NewDataField({ node, isRoot }: NewDBFieldProps) {
  const { tooltip, inline } = newFormat(node);

  return (
    <Condition.Container isRoot={isRoot}>
      <Condition.Item isRoot={isRoot}>
        <Tooltip.Default
          content={
            <span className="font-medium text-purple-100">{tooltip}</span>
          }
        >
          <span
            // Hack to have text-ellipsis truncate beggining of the fields
            dir="rtl"
            className="max-w-[250px] overflow-hidden text-ellipsis font-medium text-purple-100 max-md:max-w-[150px]"
          >
            {inline}
          </span>
        </Tooltip.Default>
      </Condition.Item>
    </Condition.Container>
  );
}
