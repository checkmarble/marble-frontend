import * as R from 'remeda';

import { type ScenarioIterationSummary } from './scenario';

//TODO(merge view/edit): create an adapter + extract the sort logic. Move to a repository/service
export function sortScenarioIterations<T extends ScenarioIterationSummary>(
  scenarioIterations: T[],
  liveVersionId?: string,
) {
  return R.pipe(
    scenarioIterations,
    R.partition(({ version }) => R.isDefined(version)),
    ([versions, drafts]) => {
      const sortedDrafts = R.pipe(
        drafts,
        R.map((draft) => ({ ...draft, type: 'draft' as const })),
        R.sortBy([({ createdAt }) => createdAt, 'desc']),
      );

      const sortedVersions = R.pipe(
        versions,
        R.map((version) => ({
          ...version,
          type:
            version.id === liveVersionId
              ? ('live version' as const)
              : ('past version' as const),
        })),
        R.sortBy([({ createdAt }) => createdAt, 'desc']),
      );

      return [...sortedDrafts, ...sortedVersions];
    },
  );
}

export type SortedScenarioIteration = ReturnType<
  typeof sortScenarioIterations
> extends Array<infer ItemT>
  ? ItemT
  : unknown;
