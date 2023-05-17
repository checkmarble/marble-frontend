import { type ConstantOperator } from '@marble-front/operators';
import { assertNever } from '@marble-front/typescript-utils';
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
            'text-grey-100 text-center font-medium only-of-type:w-full',
            className
          )}
          {...otherProps}
        />
      </Condition.Item>
    </Condition.Container>
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

  const constantType = operator.type;
  switch (constantType) {
    // case 'string':
    //   return <DefaultConstant>{`"${value.value}"`}</DefaultConstant>;
    case 'FLOAT_SCALAR':
      return (
        <DefaultConstant>
          {Intl.NumberFormat(i18n.language).format(operator.staticData.value)}
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
      assertNever('unknwon ConstantOperator:', constantType);
  }
}
