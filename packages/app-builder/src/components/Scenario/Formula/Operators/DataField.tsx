import {
  type DataFieldOperator,
  isDbFieldOperator,
} from '@app-builder/services/operators';
import { Tooltip } from '@ui-design-system';

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
