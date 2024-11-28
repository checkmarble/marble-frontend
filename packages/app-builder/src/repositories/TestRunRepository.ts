import { TestRunsFilters } from '@app-builder/components/Scenario/TestRun/Filters';
import {
  FiltersWithPagination,
  PaginatedResponse,
} from '@app-builder/models/pagination';
import {
  type TestRun,
  type TestRunCreateBody,
} from '@app-builder/models/testrun';
import { nanoid } from 'nanoid';

export type TestRunFiltersWithPagination =
  FiltersWithPagination<TestRunsFilters>;

export interface TestRunRepository {
  launchTestRun(args: TestRunCreateBody): Promise<TestRun>;
  listTestRuns(
    args: TestRunFiltersWithPagination,
  ): Promise<PaginatedResponse<TestRun>>;
}

export function makeGetTestRunRepository(runs: TestRun[]) {
  const testruns: TestRun[] = runs;

  return (): TestRunRepository => ({
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
    launchTestRun: (args: TestRunCreateBody) => {
      const testRun: TestRun = {
        id: nanoid(),
        scenarioId: args.scenarioId,
        refIterationId: args.refIterationId,
        phantomIterationId: args.phantomIterationId,
        startDate: String(new Date().getTime()),
        endDate: args.endDate,
        creatorId: '1',
        status: 'up',
      };

      testruns.push(testRun);

      return Promise.resolve(testRun);
    },
  });
}
