import { User } from '@app-builder/models';
import { ScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { TestRun } from '@app-builder/models/testrun';
import { Avatar, Tag } from 'ui-design-system';
import { TestRunStatus } from './TestRunStatus';
import { useTranslation } from 'react-i18next';
import { TestRunPeriod } from './TestRunPeriod';
import { TestRunVersions } from './TestRunVersions';

export const TestRunDetails = ({
  refIterationId,
  testIterationId,
  startDate,
  status,
  endDate,
  iterations,
  creator,
}: TestRun & {
  creator?: User;
  iterations: Record<
    string,
    Pick<ScenarioIterationWithType, 'version' | 'type'>
  >;
}) => {
  const { t } = useTranslation(['common', 'scenarios']);

  return (
    <div className="bg-grey-00 border-grey-10 flex flex-row gap-10 rounded-lg border p-8">
      <div className="flex flex-col gap-2">
        <span className="text-grey-100 font-semibold">
          {t('scenarios:testrun.filters.version')}
        </span>
        <TestRunVersions
          iterations={iterations}
          refIterationId={refIterationId}
          testIterationId={testIterationId}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-grey-100 font-semibold">
          {t('scenarios:testrun.filters.period')}
        </span>
        <TestRunPeriod
          className="h-10"
          startDate={startDate}
          endDate={endDate}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-grey-100 font-semibold">
          {t('scenarios:testrun.filters.creator')}
        </span>
        <div className="flex flex-row items-center gap-4">
          <Avatar
            firstName={creator?.firstName}
            lastName={creator?.lastName}
            size="m"
          />
          {creator ? (
            <span className="text-grey-100 text-s">
              {creator.firstName} {creator.lastName}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-grey-100 font-semibold">
          {t('scenarios:testrun.filters.status')}
        </span>
        <div className="flex flex-row items-center gap-1">
          <TestRunStatus status={status} />
        </div>
      </div>
    </div>
  );
};
