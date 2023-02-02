import type { PlainMessage } from '@bufbuild/protobuf';
import type { Scalar as ScalarMessage } from '@marble-front/api/marble';
import { assertNever } from '@marble-front/builder/utils/assert-never';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { scenarioI18n } from '../../scenario-i18n';

/**
 * only-of-type:w-full is necessary to handle text center in Formula 'data' case :
 *  <Container.Item>
 *    <Data />
 *  </Container.Item>
 */
const commonScalarClass =
  'text-grey-100 text-center font-medium only-of-type:w-full';

export function Scalar({
  scalar: { value },
}: {
  scalar: PlainMessage<ScalarMessage>;
}) {
  const { t, i18n } = useTranslation(scenarioI18n);

  switch (value.case) {
    case 'string':
      return <span className={commonScalarClass}>{`"${value.value}"`}</span>;
    case 'float':
    case 'int':
      return (
        <span className={commonScalarClass}>
          {Intl.NumberFormat(i18n.language).format(value.value)}
        </span>
      );
    case 'bool':
      return (
        <span className={clsx(commonScalarClass, 'uppercase')}>
          {t(`scenarios:${value.value}`)}
        </span>
      );
    case undefined:
      return null;
    default:
      assertNever('unknwon Scalar case:', value);
  }
}
