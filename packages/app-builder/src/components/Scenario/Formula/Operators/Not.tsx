import { type NotOperator } from '@app-builder/models';

import { Formula } from '../Formula';
import { Condition } from './Condition';

interface NotProps {
  operator: NotOperator;
  isRoot?: boolean;
}
export function Not({ operator, isRoot }: NotProps) {
  return (
    <Condition.Container isRoot={isRoot}>
      <Condition.Item isRoot={isRoot}>
        {!(<Formula formula={operator.children[0]} />)}
      </Condition.Item>
    </Condition.Container>
  );
}
