import {
  type AstNode,
  type MathOperator as MathOperatorType,
} from '@app-builder/models';
import { assertNever } from '@typescript-utils';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { scenarioI18n } from '../../scenario-i18n';
import { Formula } from '../Formula';
import { Condition } from './Condition';

interface MathProps {
  node: AstNode;
  isRoot?: boolean;
}

export function Math({ node, isRoot }: MathProps) {
  return (
    <Condition.Container isRoot={isRoot}>
      {node.children?.map((child, index) => {
        return (
          <React.Fragment key={`${child.name ?? 'constant'}-${index}`}>
            {index !== 0 && (
              <Condition.Item className="px-4" isRoot={isRoot}>
                <MathOperator operatorName={node.name ?? ''} />
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

function MathOperator({ operatorName }: { operatorName: string }) {
  return <span className="text-grey-100 font-semibold">{operatorName}</span>;
}
