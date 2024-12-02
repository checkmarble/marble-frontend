import { type TestRunsFilters } from '@app-builder/components/Scenario/TestRun/Filters';
import {
  type FiltersWithPagination,
  type PaginatedResponse,
} from '@app-builder/models/pagination';
import {
  type TestRun,
  type TestRunCreateInput,
  type TestRunStatus,
  testRunStatuses,
} from '@app-builder/models/testrun';
import { randomInteger } from 'remeda';

export type TestRunFiltersWithPagination =
  FiltersWithPagination<TestRunsFilters> & { scenarioId: string };

export interface TestRunRepository {
  getTestRun(args: { testRunId: string }): Promise<TestRun>;
  launchTestRun(args: TestRunCreateInput): Promise<TestRun>;
  listTestRuns(
    args: TestRunFiltersWithPagination,
  ): Promise<PaginatedResponse<TestRun>>;
}

export function makeGetTestRunRepository(runs: TestRun[]) {
  const testruns: TestRun[] = runs;

  return (): TestRunRepository => ({
    getTestRun: ({ testRunId }) => {
      const run = testruns.find((run) => run.id === testRunId);
      return run
        ? Promise.resolve(run)
        : Promise.reject(new Error('Test run not found'));
    },
    listTestRuns: () =>
      Promise.resolve({
        items: testruns,
        totalCount: {
          value: testruns.length,
          isMaxCount: false,
        },
        startIndex: 0,
        endIndex: testruns.length - 1,
      }),
    launchTestRun: (args: TestRunCreateInput) => {
      const lastRun = testruns[testruns.length - 1];

      const testRun: TestRun = {
        id: lastRun ? String(+lastRun.id + 1) : '1',
        refIterationId: '6f6fe0d8-9a1a-4d5a-bdd7-fa7fcda1b4e3',
        scenarioId: args.scenarioId,
        testIterationId: args.testIterationId,
        startDate: String(new Date().getTime()),
        endDate: args.endDate,
        creatorId: '1',
        status: testRunStatuses[
          randomInteger(0, testRunStatuses.length - 1)
        ] as TestRunStatus,
      };

      testruns.push(testRun);

      return Promise.resolve(testRun);
    },
  });
}
