import { type User } from '@app-builder/models';
import { type ScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { type TestRun } from '@app-builder/models/testrun';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import clsx from 'clsx';
import { Avatar } from 'ui-design-system';

import { TestRunPeriod } from './TestRunPeriod';
import { TestRunStatus } from './TestRunStatus';
import { TestRunVersions } from './TestRunVersions';

export const TestRunSelector = ({
  id,
  status,
  refIterationId,
  testIterationId,
  creatorId,
  startDate,
  endDate,
  users,
  iterations,
}: TestRun & {
  users: Record<string, Pick<User, 'firstName' | 'lastName'>>;
  iterations: Record<
    string,
    Pick<ScenarioIterationWithType, 'version' | 'type'>
  >;
}) => {
  const currentScenario = useCurrentScenario();

  return (
    <Link
      to={getRoute('/scenarios/:scenarioId/test-run/:testRunId', {
        scenarioId: fromUUID(currentScenario.id),
        testRunId: fromUUID(id),
      })}
      className={clsx(
        'grid cursor-pointer grid-cols-[30%_30%_8%_auto] items-center rounded-lg border py-4 transition-colors',
        {
          'bg-grey-100 hover:bg-grey-95 border-grey-90': status !== 'up',
          'bg-purple-98 hover:bg-purple-96 border-purple-65': status === 'up',
        },
      )}
    >
      <div className="px-4">
        <TestRunVersions
          iterations={iterations}
          refIterationId={refIterationId}
          testIterationId={testIterationId}
        />
      </div>
      <div className="px-4">
        <TestRunPeriod startDate={startDate} endDate={endDate} />
      </div>
      <div className="flex flex-row items-center justify-center">
        <Avatar
          firstName={users[creatorId]?.firstName}
          lastName={users[creatorId]?.lastName}
        />
      </div>
      <div className="px-4">
        <TestRunStatus status={status} />
      </div>
    </Link>
  );
};
