import { Spinner } from '@app-builder/components/Spinner';
import { TestRun } from '@app-builder/models/testrun';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { useNavigate } from '@remix-run/react';
import clsx from 'clsx';
import { Tag, Avatar } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const TestRunPreview = ({
  id,
  status,
  refIterationId,
  testIterationId: phantomIterationId,
  creatorId,
  startDate,
  endDate,
}: TestRun) => {
  const navigate = useNavigate();
  const currentScenario = useCurrentScenario();

  return (
    <div
      onClick={() => {
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
      )}
    >
      <div className="px-4">
        <div className="flex flex-row items-center gap-1">
          <Tag
            size="big"
            color="grey-light"
            className="border-grey-10 gap-1 border px-4 py-2"
          >
            <span className="text-grey-100 font-semibold">V3</span>
            <span className="font-semibold text-purple-100">Live</span>
          </Tag>
          <Icon icon="arrow-range" className="text-grey-100 size-5" />
          <Tag
            size="big"
            color="grey-light"
            className="border-grey-10 border px-4 py-2"
          >
            V4
          </Tag>
        </div>
      </div>
      <div className="px-4">
        <span className="text-s inline-flex flex-row items-center gap-1">
          From
          <span className="font-semibold">04.10.24</span>
          To
          <span className="font-semibold">04.11.24</span>
        </span>
      </div>
      <div className="flex flex-row items-center justify-center">
        <Avatar firstName="Jean" lastName="Christophe" />
      </div>
      <div className="px-4">
        {status === 'up' ? (
          <Tag
            border="square"
            size="big"
            className="inline-flex flex-row items-center gap-1 bg-purple-100"
          >
            <Spinner className="size-3" />
            <span className="text-grey-00 text-s font-semibold">Ongoing</span>
          </Tag>
        ) : (
          <Tag
            border="square"
            size="big"
            color="grey"
            className="inline-flex flex-row items-center gap-1"
            aria-disabled
          >
            <span className="text-grey-50 text-s font-semibold">Archived</span>
          </Tag>
        )}
      </div>
    </div>
  );
};
