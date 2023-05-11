import {
  type DataFieldOperator,
  isDBFieldOperator,
} from '@marble-front/operators';
import { Tooltip } from '@marble-front/ui/design-system';

import { Condition } from './Condition';

interface DBFieldProps {
  operator: DataFieldOperator;
  isRoot?: boolean;
}

function getFields(operator: DataFieldOperator) {
  if (isDBFieldOperator(operator)) {
    return [...operator.staticData.path, operator.staticData.fieldName];
  }
  return [operator.staticData.fieldName];
}

export function DataField({ operator, isRoot }: DBFieldProps) {
  const fields = getFields(operator);

  return (
    <Condition.Container isRoot={isRoot}>
      <Condition.Item isRoot={isRoot}>
        <Tooltip.Default
          content={
            <span className="font-medium text-purple-100">
              {fields.join('.')}
            </span>
          }
        >
          <span
            // Hack to have text-ellipsis truncate beggining of the fields
            dir="rtl"
            className="max-w-[250px] overflow-hidden text-ellipsis font-medium text-purple-100 max-md:max-w-[150px]"
          >
            {fields.slice(1).join('.')}
          </span>
        </Tooltip.Default>
      </Condition.Item>
    </Condition.Container>
  );
}
