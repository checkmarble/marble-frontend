import { type TestRunStatus } from '@app-builder/models/testrun';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ParseKeys } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'ui-design-system';

export const testRunStatusVariants = cva(
  'inline-flex items-center justify-center rounded shrink-0',
  {
    variants: {
      color: {
        red: 'text-red-100 bg-red-10',
        blue: 'text-blue-100 bg-blue-10',
        grey: 'text-grey-50 bg-grey-10',
        green: 'text-green-100 bg-green-10',
      },
      size: {
        small: undefined,
        big: undefined,
      },
      type: {
        'first-letter': 'isolate capitalize text-s font-medium',
        full: 'px-2 w-fit capitalize text-s font-semibold',
      },
    },
    compoundVariants: [
      {
        size: 'small',
        type: 'full',
        className: 'h-6',
      },
      {
        size: 'big',
        type: 'full',
        className: 'h-10',
      },
      {
        size: 'small',
        type: 'first-letter',
        className: 'size-6',
      },
      {
        size: 'big',
        type: 'first-letter',
        className: 'size-8',
      },
    ],
  },
);

export function TestRunStatus({
  status,
  size,
  type,
}: {
  status: TestRunStatus;
  size?: VariantProps<typeof testRunStatusVariants>['size'];
  type?: VariantProps<typeof testRunStatusVariants>['type'];
}) {
  const { t } = useTranslation(['scenarios']);
  const { color, tKey } = testRunStatusMapping[status];
  const testRunStatusLetter = t(tKey);

  if (type === 'full') {
    return (
      <div className={testRunStatusVariants({ color, size, type: 'full' })}>
        {testRunStatusLetter}
      </div>
    );
  }

  return (
    <Tooltip.Default
      content={
        <div
          className={testRunStatusVariants({
            color,
            size: 'big',
            type: 'full',
          })}
        >
          {testRunStatusLetter}
        </div>
      }
    >
      <div
        className={testRunStatusVariants({ color, size, type: 'first-letter' })}
      >
        {testRunStatusLetter[0]}
      </div>
    </Tooltip.Default>
  );
}

export const testRunStatusMapping = {
  up: {
    color: 'blue',
    tKey: 'scenarios:testrun.status.up',
  },
  down: {
    color: 'red',
    tKey: 'scenarios:testrun.status.down',
  },
  unknown: {
    color: 'grey',
    tKey: 'scenarios:testrun.status.unknown',
  },
  pending: {
    color: 'green',
    tKey: 'scenarios:testrun.status.pending',
  },
} satisfies Record<
  TestRunStatus,
  {
    color: VariantProps<typeof testRunStatusVariants>['color'];
    tKey: ParseKeys<['scenarios']>;
  }
>;

const statuses = ['unknown', 'down', 'up', 'pending'] satisfies TestRunStatus[];
export function useTestRunStatuses() {
  const { t } = useTranslation(['scenarios']);

  return useMemo(
    () =>
      statuses.map((status) => ({
        value: status,
        label: t(testRunStatusMapping[status].tKey),
      })),
    [t],
  );
}
