import { Spinner } from '@app-builder/components/Spinner';
import { type TestRunStatus as TestRStatus } from '@app-builder/models/testrun';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Tag } from 'ui-design-system';

export const TestRunStatus = ({ status }: { status: TestRStatus }) => {
  const { t } = useTranslation(['scenarios']);

  return match(status)
    .with('up', () => (
      <Tag size="big" color="purple" className="bg-purple-primary gap-2">
        <Spinner className="text-grey-white size-3" />
        <span className="text-s text-grey-white font-semibold">{t('scenarios:testrun.status.up')}</span>
      </Tag>
    ))
    .with('down', () => (
      <Tag size="big" color="red">
        <span className="text-s font-semibold">{t('scenarios:testrun.status.down')}</span>
      </Tag>
    ))
    .with('unknown', () => (
      <Tag size="big" color="orange">
        <span className="text-s font-semibold">{t('scenarios:testrun.status.unknown')}</span>
      </Tag>
    ))
    .with('pending', () => (
      <Tag size="big" color="yellow">
        <span className="text-s font-semibold">{t('scenarios:testrun.status.pending')}</span>
      </Tag>
    ))
    .exhaustive();
};
