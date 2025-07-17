import { Spinner } from '@app-builder/components/Spinner';
import { type TestRunStatus as TestRStatus } from '@app-builder/models/testrun';
import { TranslationObject } from '@app-builder/types/i18n';
import { match } from 'ts-pattern';
import { Tag } from 'ui-design-system';

export const TestRunStatus = ({
  status,
  translationObject,
}: {
  status: TestRStatus;
  translationObject: TranslationObject<['scenarios', 'common']>;
}) => {
  const { tScenarios } = translationObject;

  return match(status)
    .with('up', () => (
      <Tag border="square" size="big" color="purple" className="bg-purple-65 gap-2">
        <Spinner className="text-grey-100 size-3" translationObject={translationObject} />
        <span className="text-s text-grey-100 font-semibold">
          {tScenarios('testrun.status.up')}
        </span>
      </Tag>
    ))
    .with('down', () => (
      <Tag border="square" size="big" color="red">
        <span className="text-s font-semibold">{tScenarios('testrun.status.down')}</span>
      </Tag>
    ))
    .with('unknown', () => (
      <Tag border="square" size="big" color="orange">
        <span className="text-s font-semibold">{tScenarios('testrun.status.unknown')}</span>
      </Tag>
    ))
    .with('pending', () => (
      <Tag border="square" size="big" color="yellow">
        <span className="text-s font-semibold">{tScenarios('testrun.status.pending')}</span>
      </Tag>
    ))
    .exhaustive();
};
