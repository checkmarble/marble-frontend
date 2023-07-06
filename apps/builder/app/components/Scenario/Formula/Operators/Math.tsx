import {
  type MathOperator as MathOperatorType,
  type MathOperatorNode,
  type MathOperatorNodeName,
} from '@marble-front/operators';
import { assertNever } from '@marble-front/typescript-utils';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { scenarioI18n } from '../../scenario-i18n';
import { Formula, NewFormula } from '../Formula';
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

// Function instead of object mapping to handle possible translation (ex: "IS IN" operator)
export function useGetOperatorLabel() {
  const { t } = useTranslation(scenarioI18n);

  return useCallback(
    (type: MathOperatorType['type']) => {
      switch (type) {
        case 'EQUAL_BOOL':
        case 'EQUAL_FLOAT':
        case 'EQUAL_STRING':
          return '=';
        // case 'NOT_EQUAL_BOOL':
        //   return '≠';
        case 'AND':
        case 'PRODUCT_FLOAT':
          return '×';
        case 'OR':
        case 'SUM_FLOAT':
          return '+';
        case 'SUBTRACT_FLOAT':
          return '−';
        case 'DIVIDE_FLOAT':
          return '÷';
        case 'GREATER_FLOAT':
          return '>';
        case 'GREATER_OR_EQUAL_FLOAT':
          return '≥';
        case 'LESSER_FLOAT':
          return '<';
        case 'LESSER_OR_EQUAL_FLOAT':
          return '≤';
        case 'STRING_IS_IN_LIST':
          return t('scenarios:operator.is_in');
        default:
          assertNever('unknwon Math operator :', type);
      }
    },
    [t]
  );
}

function MathOperator({
  operatorType,
}: {
  operatorType: MathOperatorType['type'];
}) {
  const getOperatorLabel = useGetOperatorLabel();
  return (
    <span className="text-grey-100 font-semibold">
      {getOperatorLabel(operatorType)}
    </span>
  );
}

interface NewMathProps {
  node: MathOperatorNode;
  isRoot?: boolean;
}

export function NewMath({ node, isRoot }: NewMathProps) {
  const operatorName = node.operatorName;
  let operands;
  if (operatorName === 'STRING_IS_IN_LIST') {
    operands = [node.namedChildren.value, node.namedChildren.list];
  } else {
    operands = node.children;
  }
  return (
    <Condition.Container isRoot={isRoot}>
      {operands.map((operand, index) => {
        return (
          <React.Fragment key={`${operand.operatorName}-${index}`}>
            {index !== 0 && (
              <Condition.Item className="px-4" isRoot={isRoot}>
                <NewMathOperator operatorName={operatorName} />
              </Condition.Item>
            )}
            <Condition.Item isRoot={isRoot}>
              <NewFormula node={operand} />
            </Condition.Item>
          </React.Fragment>
        );
      })}
    </Condition.Container>
  );
}

// Function instead of obejct mapping to handle possible translation (ex: "IS IN" operator)
function useGetNewOperatorLabel() {
  const { t } = useTranslation(scenarioI18n);

  return useCallback(
    (operatorName: MathOperatorNodeName) => {
      switch (operatorName) {
        case 'AND':
          return '×';
        case 'OR':
          return '+';
        case 'GREATER':
          return '>';
        case 'STRING_IS_IN_LIST':
          return t('scenarios:operator.is_in');
        default:
          assertNever('unknwon Math operator :', operatorName);
      }
    },
    [t]
  );
}

function NewMathOperator({
  operatorName,
}: {
  operatorName: MathOperatorNodeName;
}) {
  const getOperatorLabel = useGetNewOperatorLabel();
  return (
    <span className="text-grey-100 font-semibold">
      {getOperatorLabel(operatorName)}
    </span>
  );
}
