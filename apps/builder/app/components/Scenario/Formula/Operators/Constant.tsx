import { formatNumber } from '@marble-front/builder/utils/format';
import { type ConstantOperator } from '@marble-front/operators';
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
          /**
           * only-of-type:w-full is necessary to handle text center in Formula 'data' case :
           *  <Container.Item>
           *    <Data />
           *  </Container.Item>
           */
          className={clsx(
            'text-grey-100 flex whitespace-pre text-center font-medium only-of-type:w-full',
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

  //TODO: extract operator.staticData.value when all constant operators follow the same structure
  const { type } = operator;
  switch (type) {
    case 'STRING_LIST_CONSTANT': {
      const formattedValue = formatArray(
        operator.staticData.value,
        formatString
      );
      return <DefaultList isRoot={isRoot}>{formattedValue}</DefaultList>;
    }
    case 'STRING_SCALAR':
      return (
        <DefaultConstant isRoot={isRoot}>
          {formatString(operator.staticData.value)}
        </DefaultConstant>
      );
    case 'FLOAT_SCALAR':
      return (
        <DefaultConstant isRoot={isRoot}>
          {formatNumber(i18n.language, operator.staticData.value)}
        </DefaultConstant>
      );
    case 'TRUE':
      return (
        <DefaultConstant className="uppercase" isRoot={isRoot}>
          {t(`scenarios:true`)}
        </DefaultConstant>
      );
    case 'FALSE':
      return (
        <DefaultConstant className="uppercase" isRoot={isRoot}>
          {t(`scenarios:false`)}
        </DefaultConstant>
      );
    default:
      assertNever('unknwon ConstantOperator:', type);
  }
}

function formatString(value: string) {
  return `"${value}"`;
}

function formatArray<T>(value: T[] = [], formatValue: (value: T) => string) {
  return value.map(formatValue).join(', ');
}
