import { Spinner } from '@app-builder/components/Spinner';
import { User } from '@app-builder/models';
import { ScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { TestRun } from '@app-builder/models/testrun';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { match } from 'ts-pattern';
import { Avatar, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

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
  const language = useFormatLanguage();

  return (
    <div className="bg-grey-00 border-grey-10 flex flex-row gap-10 rounded-lg border p-8">
      <div className="flex flex-col gap-2">
        <span className="text-grey-100 font-semibold">Version</span>
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
      <div className="flex flex-col gap-2">
        <span className="text-grey-100 font-semibold">Period</span>
        <span className="text-s inline-flex h-10 flex-row items-center gap-1">
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
      <div className="flex flex-col gap-2">
        <span className="text-grey-100 font-semibold">Creator</span>
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
        <span className="text-grey-100 font-semibold">Status</span>
        <div className="flex flex-row items-center gap-1">
          {match(status)
            .with('up', () => (
              <Tag
                border="square"
                size="big"
                className="inline-flex flex-row items-center gap-1 bg-purple-100"
              >
                <Spinner className="size-3" />
                <span className="text-grey-00 text-s font-semibold">
                  Ongoing
                </span>
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
                <span className="text-grey-50 text-s font-semibold">
                  Unknown
                </span>
              </Tag>
            ))
            .with('pending', () => (
              <Tag
                border="square"
                size="big"
                color="grey-light"
                className="inline-flex flex-row items-center gap-2"
              >
                <span className="text-grey-50 text-s font-semibold">
                  Pending
                </span>
              </Tag>
            ))
            .exhaustive()}
        </div>
      </div>
    </div>
  );
};
