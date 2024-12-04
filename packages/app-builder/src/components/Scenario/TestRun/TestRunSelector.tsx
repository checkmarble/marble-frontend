import { type User } from '@app-builder/models';
import { type ScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { type TestRun } from '@app-builder/models/testrun';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { useNavigate } from '@remix-run/react';
import clsx from 'clsx';
import { Avatar } from 'ui-design-system';
import { TestRunStatus } from './TestRunStatus';
import { TestRunPeriod } from './TestRunPeriod';
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
  const navigate = useNavigate();
  const currentScenario = useCurrentScenario();

  return (
    <div
      onPointerDown={() => {
        navigate(
          getRoute('/scenarios/:scenarioId/test-run/:testRunId', {
            scenarioId: fromUUID(currentScenario.id),
            testRunId: fromUUID(id),
          }),
        );
      }}
      className={clsx(
        'grid-cols-test-run grid cursor-pointer items-center rounded-lg border py-4 transition-colors',
        {
          'bg-grey-00 hover:bg-grey-05 border-grey-10': status !== 'up',
          'bg-purple-05 hover:bg-purple-10 border-purple-100': status === 'up',
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
    </div>
  );
};
