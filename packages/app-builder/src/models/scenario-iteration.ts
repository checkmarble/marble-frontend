import {
  type ScenarioIterationDto,
  type ScenarioIterationWithBodyDto,
} from 'marble-api';
import * as R from 'remeda';

import { adaptAstNode, type AstNode } from './ast-node';
import {
  adaptScenarioIterationRule,
  type ScenarioIterationRule,
} from './scenario-iteration-rule';

export interface ScenarioIterationSummary {
  id: string;
  scenarioId: string;
  version: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioIteration {
  id: string;
  scenarioId: string;
  version: number | null;
  createdAt: string;
  updatedAt: string;
  scoreReviewThreshold?: number;
  scoreRejectThreshold?: number;
  rules: ScenarioIterationRule[];
  schedule?: string;
  trigger: AstNode | null;
}

export function adaptScenarioIteration(
  scenarioIterationWithBody: ScenarioIterationWithBodyDto,
): ScenarioIteration {
  const triggerDto =
    scenarioIterationWithBody.body.trigger_condition_ast_expression;

  return {
    id: scenarioIterationWithBody.id,
    scenarioId: scenarioIterationWithBody.scenarioId,
    version: scenarioIterationWithBody.version,
    createdAt: scenarioIterationWithBody.createdAt,
    updatedAt: scenarioIterationWithBody.updatedAt,
    scoreReviewThreshold: scenarioIterationWithBody.body.scoreReviewThreshold,
    scoreRejectThreshold: scenarioIterationWithBody.body.scoreRejectThreshold,
    rules: scenarioIterationWithBody.body.rules.map(adaptScenarioIterationRule),
    schedule: scenarioIterationWithBody.body.schedule,
    trigger: triggerDto ? adaptAstNode(triggerDto) : null,
  };
}

export function adaptScenarioIterationSummary(
  dto: ScenarioIterationDto,
): ScenarioIterationSummary {
  return {
    id: dto.id,
    scenarioId: dto.scenarioId,
    version: dto.version,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

//TODO(merge view/edit): create an adapter + extract the sort logic. Move to a repository/service
export function sortScenarioIterations<T extends ScenarioIterationSummary>(
  scenarioIterations: T[],
  liveVersionId?: string,
) {
  return R.pipe(
    scenarioIterations,
    R.partition(({ version }) => R.isNonNullish(version)),
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
              : ('version' as const),
        })),
        R.sortBy([({ createdAt }) => createdAt, 'desc']),
      );

      return [...sortedDrafts, ...sortedVersions];
    },
  );
}

export type SortedScenarioIteration =
  ReturnType<typeof sortScenarioIterations> extends Array<infer ItemT>
    ? ItemT
    : unknown;
