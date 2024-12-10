import { Spinner } from '@app-builder/components/Spinner';
import { type TestRunStatus as TestRStatus } from '@app-builder/models/testrun';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Tag } from 'ui-design-system';

export const TestRunStatus = ({ status }: { status: TestRStatus }) => {
  const { t } = useTranslation(['scenarios']);

  return match(status)
    .with('up', () => (
      <Tag
        border="square"
        size="big"
        color="purple"
        className="gap-2 bg-purple-100"
      >
        <Spinner className="text-grey-00 size-3" />
        <span className="text-s text-grey-00 font-semibold">
          {t('scenarios:testrun.status.up')}
        </span>
      </Tag>
    ))
    .with('down', () => (
      <Tag border="square" size="big" color="red">
        <span className="text-s font-semibold">
          {t('scenarios:testrun.status.down')}
        </span>
      </Tag>
    ))
    .with('unknown', () => (
      <Tag border="square" size="big" color="orange">
        <span className="text-s font-semibold">
          {t('scenarios:testrun.status.unknown')}
        </span>
      </Tag>
    ))
    .with('pending', () => (
      <Tag border="square" size="big" color="yellow">
        <span className="text-s font-semibold">
          {t('scenarios:testrun.status.pending')}
        </span>
      </Tag>
    ))
    .exhaustive();
};
