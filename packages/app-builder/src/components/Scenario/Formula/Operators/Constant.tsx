import type { AstNode, ConstantType } from '@app-builder/models';
import { formatNumber } from '@app-builder/utils/format';
import { Tooltip } from '@ui-design-system';
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

export function stringifyConstant(constant?: ConstantType): string {
  return constant === undefined ? '(no constant)' : JSON.stringify(constant);
}

export function Constant({
  node,
  isRoot,
}: {
  node: AstNode;
  isRoot?: boolean;
}) {
  const { t, i18n } = useTranslation(scenarioI18n);

  switch (typeof node.constant) {
    case 'object': {
      if (
        Array.isArray(node.constant) &&
        node.constant.every((i) => typeof i === 'string')
      ) {
        const formattedValue = formatArray(
          node.constant as string[],
          formatString
        );
        return <DefaultList isRoot={isRoot}>{formattedValue}</DefaultList>;
      }
      return (
        <DefaultList isRoot={isRoot}>
          {stringifyConstant(node.constant)}
        </DefaultList>
      );
    }
    case 'string':
      return (
        <DefaultConstant isRoot={isRoot}>
          {formatString(node.constant)}
        </DefaultConstant>
      );
    case 'number':
      return (
        <DefaultConstant isRoot={isRoot}>
          {formatNumber(node.constant, { language: i18n.language })}
        </DefaultConstant>
      );
    case 'boolean':
      return (
        <DefaultConstant className="uppercase" isRoot={isRoot}>
          {t(`scenarios:${node.constant}`)}
        </DefaultConstant>
      );
    default:
      return (
        <DefaultList isRoot={isRoot}>
          {stringifyConstant(node.constant)}
        </DefaultList>
      );
  }
}

function formatString(value: string) {
  return `"${value}"`;
}

function formatArray<T>(value: T[] = [], formatValue: (value: T) => string) {
  return value.map(formatValue).join(', ');
}
