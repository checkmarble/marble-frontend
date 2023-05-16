import { type MathOperator as MathOperatorType } from '@marble-front/operators';
import { assertNever } from '@marble-front/typescript-utils';
import React from 'react';

import { Formula } from '../Formula';
import { Condition } from './Condition';

interface MathProps {
  operator: MathOperatorType;
  isRoot?: boolean;
}

export function Math({ operator, isRoot }: MathProps) {
  return (
    <Condition.Container isRoot={isRoot}>
      {operator.children.map((child, index) => {
        return (
          <React.Fragment key={`${child.type}-${index}`}>
            {index !== 0 && (
              <Condition.Item className="px-4" isRoot={isRoot}>
                <MathOperator operatorType={operator.type} />
              </Condition.Item>
            )}
            <Condition.Item isRoot={isRoot}>
              <Formula formula={child} />
            </Condition.Item>
          </React.Fragment>
        );
      })}
    </Condition.Container>
  );
}

// Function instead of obejct mapping to handle possible translation (ex: "IS IN" operator)
function getOperatorLabel(type: MathOperatorType['type']) {
  switch (type) {
    case 'EQUAL_BOOL':
      return '=';
    // case 'NOT_EQUAL_BOOL':
    //   return '≠';
    case 'AND':
      return '×';
    case 'OR':
      return '+';
    // case "SUBTRACT":
    //   return '−';
    // case "DIVIDE":
    //   return '÷';
    // case "GREATER":
    //   return '>';
    // case "GREATER_EQUAL":
    //   return '≥';
    // case "LOWER":
    //   return '<';
    // case "LOWER_EQUAL":
    //   return '≤';
    default:
      assertNever('unknwon Math operator :', type);
  }
}

function MathOperator({
  operatorType,
}: {
  operatorType: MathOperatorType['type'];
}) {
  return (
    <span className="text-grey-100 font-semibold">
      {getOperatorLabel(operatorType)}
    </span>
  );
}
