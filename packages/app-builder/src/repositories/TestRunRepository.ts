import { type TestRunsFilters } from '@app-builder/components/Scenario/TestRun/Filters';
import { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  type FiltersWithPagination,
  type PaginatedResponse,
} from '@app-builder/models/pagination';
import {
  adaptTestRun,
  adaptTestRunCreateInputDto,
  type TestRun,
  type TestRunCreateInput,
} from '@app-builder/models/testrun';

export type TestRunFiltersWithPagination =
  FiltersWithPagination<TestRunsFilters> & { scenarioId: string };

export interface TestRunRepository {
  getTestRun(args: { testRunId: string }): Promise<TestRun>;
  launchTestRun(args: TestRunCreateInput): Promise<TestRun>;
  listTestRuns(
    args: TestRunFiltersWithPagination,
  ): Promise<PaginatedResponse<TestRun>>;
}

export const makeGetTestRunRepository = () => {
  return (marbleCoreApiClient: MarbleCoreApi): TestRunRepository => ({
    getTestRun: async ({ testRunId }) => {
      const result = await marbleCoreApiClient.getTestRun(testRunId);
      return adaptTestRun(result);
    },
    launchTestRun: async (args) => {
      const result = await marbleCoreApiClient.createTestRun(
        adaptTestRunCreateInputDto(args),
      );
      return adaptTestRun(result);
    },
    listTestRuns: async ({ scenarioId }) => {
      const runs = await marbleCoreApiClient.listTestRuns(scenarioId);

      //TODO: Implement pagination & sorting

      return {
        items: runs.map(adaptTestRun),
        totalCount: {
          value: runs.length,
          isMaxCount: false,
        },
        startIndex: 0,
        endIndex: runs.length - 1,
      };
    },
  });
};
