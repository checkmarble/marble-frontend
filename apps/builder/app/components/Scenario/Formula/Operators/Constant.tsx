import { formatNumber } from '@marble-front/builder/utils/format';
import {
  type ConstantNode,
  type ConstantOperator,
} from '@marble-front/operators';
import { assertNever } from '@marble-front/typescript-utils';
import { Tooltip } from '@marble-front/ui/design-system';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { scenarioI18n } from '../../scenario-i18n';
import { Condition } from './Condition';

interface ScalarProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  > {
  isRoot?: boolean;
}

function DefaultConstant({ className, isRoot, ...otherProps }: ScalarProps) {
  return (
    <Condition.Container isRoot={isRoot}>
      <Condition.Item isRoot={isRoot}>
        <span
          className={clsx(
            'text-grey-100 flex whitespace-pre text-center font-medium',
            className
          )}
          {...otherProps}
        />
      </Condition.Item>
    </Condition.Container>
  );
}

function DefaultList({ isRoot, children, ...otherProps }: ScalarProps) {
  return (
    <DefaultConstant isRoot={isRoot} {...otherProps}>
      {'[ '}
      <Tooltip.Default
        content={
          <span className="text-grey-100 text-center font-medium">
            [ {children} ]
          </span>
        }
      >
        <span className="max-w-[250px] truncate max-md:max-w-[150px]">
          {children}
        </span>
      </Tooltip.Default>
      {' ]'}
    </DefaultConstant>
  );
}

export function Constant({
  operator,
  isRoot,
}: {
  operator: ConstantOperator;
  isRoot?: boolean;
}) {
  const { t, i18n } = useTranslation(scenarioI18n);

  const { type } = operator;
  switch (type) {
    case 'STRING_LIST_CONSTANT': {
      const formattedValue = formatArray(
        operator.staticData.value,
        formatString
      );
      return <DefaultList isRoot={isRoot}>{formattedValue}</DefaultList>;
    }
    case 'STRING_CONSTANT':
      return (
        <DefaultConstant isRoot={isRoot}>
          {formatString(operator.staticData.value)}
        </DefaultConstant>
      );
    case 'FLOAT_CONSTANT':
      return (
        <DefaultConstant isRoot={isRoot}>
          {formatNumber(i18n.language, operator.staticData.value)}
        </DefaultConstant>
      );
    case 'BOOL_CONSTANT':
      return (
        <DefaultConstant className="uppercase" isRoot={isRoot}>
          {t(`scenarios:${operator.staticData.value}`)}
        </DefaultConstant>
      );
    default:
      assertNever('unknwon ConstantOperator:', type);
  }
}

export function NewConstant({
  node,
  isRoot,
}: {
  node: ConstantNode;
  isRoot?: boolean;
}) {
  const { t, i18n } = useTranslation(scenarioI18n);

  const { operatorName, constant } = node;
  switch (operatorName) {
    case 'STRING_LIST_CONSTANT': {
      const formattedValue = formatArray(constant, formatString);
      return <DefaultList isRoot={isRoot}>{formattedValue}</DefaultList>;
    }
    case 'STRING_CONSTANT':
      return (
        <DefaultConstant isRoot={isRoot}>
          {formatString(constant)}
        </DefaultConstant>
      );
    case 'FLOAT_CONSTANT':
      return (
        <DefaultConstant isRoot={isRoot}>
          {formatNumber(i18n.language, constant)}
        </DefaultConstant>
      );
    case 'BOOL_CONSTANT':
      return (
        <DefaultConstant className="uppercase" isRoot={isRoot}>
          {t(`scenarios:${constant}`)}
        </DefaultConstant>
      );
    default:
      assertNever('unknwon ConstantOperator:', operatorName);
  }
}

function formatString(value: string) {
  return `"${value}"`;
}

function formatArray<T>(value: T[] = [], formatValue: (value: T) => string) {
  return value.map(formatValue).join(', ');
}
