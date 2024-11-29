import { Spinner } from '@app-builder/components/Spinner';
import { type User } from '@app-builder/models';
import { type ScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { type TestRun } from '@app-builder/models/testrun';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { useNavigate } from '@remix-run/react';
import clsx from 'clsx';
import { match } from 'ts-pattern';
import { Avatar, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const TestRunPreview = ({
  id,
  status,
  refIterationId,
  testIterationId,
  creatorId,
  startDate,
  endDate,
  users,
  iterations,
  className,
}: TestRun & {
  users: Record<string, Pick<User, 'firstName' | 'lastName'>>;
  iterations: Record<
    string,
    Pick<ScenarioIterationWithType, 'version' | 'type'>
  >;
  className?: string;
}) => {
  const navigate = useNavigate();
  const currentScenario = useCurrentScenario();
  const language = useFormatLanguage();

  return (
    <div
      onPointerDown={() => {
        navigate(
          getRoute('/scenarios/:scenarioId/test-run/:testRunId', {
            scenarioId: fromUUID(currentScenario.id),
            testRunId: id,
          }),
        );
      }}
      className={clsx(
        'grid-cols-test-run bg-grey-00 hover:bg-grey-05 border-grey-10 grid cursor-pointer items-center rounded-lg border py-4 transition-colors',
        {
          'bg-purple-05 hover:bg-purple-10': status !== 'up',
          'border-purple-100': status === 'up',
        },
        className,
      )}
    >
      <div className="px-4">
        <div className="flex flex-row items-center gap-1">
          <Tag
            size="big"
            color="grey-light"
            className="border-grey-10 gap-1 border px-4 py-2"
          >
            <span className="text-grey-100 font-semibold">
              {`V${iterations[refIterationId]?.version}`}
            </span>
            {iterations[refIterationId]?.type === 'live version' ? (
              <span className="font-semibold text-purple-100">Live</span>
            ) : null}
          </Tag>
          <Icon icon="arrow-range" className="text-grey-100 size-5" />
          <Tag
            size="big"
            color="grey-light"
            className="border-grey-10 border px-4 py-2"
          >
            {`V${iterations[testIterationId]?.version}`}
          </Tag>
        </div>
      </div>
      <div className="px-4">
        <span className="text-s inline-flex flex-row items-center gap-1">
          From
          <span className="font-semibold">
            {formatDateTime(new Date(+startDate), {
              language,
              timeStyle: undefined,
            })}
          </span>
          To
          <span className="font-semibold">
            {formatDateTime(new Date(+endDate), {
              language,
              timeStyle: undefined,
            })}
          </span>
        </span>
      </div>
      <div className="flex flex-row items-center justify-center">
        <Avatar
          firstName={users[creatorId]?.firstName}
          lastName={users[creatorId]?.lastName}
        />
      </div>
      <div className="px-4">
        {match(status)
          .with('up', () => (
            <Tag
              border="square"
              size="big"
              className="inline-flex flex-row items-center gap-1 bg-purple-100"
            >
              <Spinner className="size-3" />
              <span className="text-grey-00 text-s font-semibold">Ongoing</span>
            </Tag>
          ))
          .with('down', () => (
            <Tag
              border="square"
              size="big"
              color="grey"
              className="inline-flex flex-row items-center gap-2"
            >
              <span className="text-grey-50 text-s font-semibold">
                Archived
              </span>
            </Tag>
          ))
          .with('unknown', () => (
            <Tag
              border="square"
              size="big"
              color="grey-light"
              className="inline-flex flex-row items-center gap-2"
            >
              <span className="text-grey-50 text-s font-semibold">Unknown</span>
            </Tag>
          ))
          .with('pending', () => (
            <Tag
              border="square"
              size="big"
              color="grey-light"
              className="inline-flex flex-row items-center gap-2"
            >
              <span className="text-grey-50 text-s font-semibold">Pending</span>
            </Tag>
          ))
          .exhaustive()}
      </div>
    </div>
  );
};
