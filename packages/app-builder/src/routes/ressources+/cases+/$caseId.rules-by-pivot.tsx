import { Decision, DecisionDetails, RuleExecution } from '@app-builder/models/decision';
import { RuleSnoozeWithRuleId } from '@app-builder/models/rule-snooze';
import { ScenarioIterationRule } from '@app-builder/models/scenario/iteration-rule';
import { DecisionRepository } from '@app-builder/repositories/DecisionRepository';
import { ScenarioIterationRuleRepository } from '@app-builder/repositories/ScenarioIterationRuleRepository';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import * as R from 'remeda';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const {
    cases: caseRepository,
    decision: decisionRepository,
    scenarioIterationRuleRepository,
  } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const caseId = fromParams(params, 'caseId');
  const caseDetail = await caseRepository.getCase({ caseId });

  const iterationRules = await getScenarioIterationsRules(
    caseDetail.decisions,
    scenarioIterationRuleRepository,
  );

  const [decisionsDetails, snoozes] = await Promise.all([
    enrichDecisions(caseDetail.decisions, decisionRepository, iterationRules),
    getDecisionsSnoozes(caseDetail.decisions, decisionRepository),
  ]);

  const rulesByPivot = R.pipe(
    decisionsDetails,
    R.groupBy((decision) => decision.pivotValues[0]!.value!),
    R.mapValues((decisions, pivotValue) => {
      const snoozesForPivot = snoozes.filter((s) => s.pivotValue === pivotValue);
      return getRulesForSnooze(decisions, snoozesForPivot);
    }),
  );

  return Response.json({ rulesByPivot });
}

type EnrichedRuleExecution = RuleExecution & {
  ruleGroup?: string;
};

type DecisionForSnooze = Decision & {
  rules: EnrichedRuleExecution[];
};

type SnoozeData =
  | {
      isSnoozed: true;
      start: string;
      end: string;
    }
  | {
      isSnoozed: false;
      start: undefined;
      end: undefined;
    };

export type RuleWithSnoozeData = EnrichedRuleExecution & {
  hitAt: string;
  decisionId: string;
} & SnoozeData;

async function enrichDecisions(
  decisions: Decision[],
  repository: DecisionRepository,
  iterationRules: ScenarioIterationRule[],
): Promise<DecisionForSnooze[]> {
  return Promise.all(
    decisions.map((decision) => {
      return repository
        .getDecisionById(decision.id)
        .then((decisionDetail) => enrichRules(decisionDetail, iterationRules));
    }),
  );
}

async function enrichRules(
  decisionDetail: DecisionDetails,
  iterationRules: ScenarioIterationRule[],
): Promise<DecisionForSnooze> {
  return {
    ...decisionDetail,
    rules: decisionDetail.rules.map((rule) => ({
      ...rule,
      ruleGroup: iterationRules.find((r) => r.id === rule.ruleId)?.ruleGroup,
    })),
  };
}

async function getDecisionsSnoozes(
  decisions: Decision[],
  repository: DecisionRepository,
): Promise<RuleSnoozeWithRuleId[]> {
  return Promise.all(
    decisions.map((decision) => {
      return repository.getDecisionActiveSnoozes(decision.id).then((r) => r.ruleSnoozes);
    }),
  ).then((ruleSnoozesArrays) => R.flat(ruleSnoozesArrays));
}

async function getScenarioIterationsRules(
  decisions: Decision[],
  repository: ScenarioIterationRuleRepository,
): Promise<ScenarioIterationRule[]> {
  const uniqueScenarioIterationIds = R.unique(
    decisions.map((decision) => decision.scenario.scenarioIterationId),
  );

  return Promise.all(
    uniqueScenarioIterationIds.map((scenarioIterationId) => {
      return repository.listRules({ scenarioIterationId });
    }),
  ).then((rulesArrays) => R.flat(rulesArrays));
}

function getRulesForSnooze(
  decisions: DecisionForSnooze[],
  snoozes: RuleSnoozeWithRuleId[],
): RuleWithSnoozeData[] {
  const enrichedRulesArray = R.map(decisions, (decision) => {
    return decision.rules.map((rule) => ({
      ...rule,
      hitAt: decision.createdAt,
      decisionId: decision.id,
    }));
  });

  const enrichedRules = R.pipe(
    R.flat(enrichedRulesArray),
    R.uniqueBy((rule) => rule.ruleId),
  );

  const rulesWithSnoozeData = R.map(enrichedRules, (rule) => {
    const ruleSnooze = snoozes.find((s) => s.ruleId === rule.ruleId);
    if (ruleSnooze) {
      return {
        ...rule,
        isSnoozed: true,
        start: ruleSnooze.startsAt,
        end: ruleSnooze.endsAt,
      } satisfies RuleWithSnoozeData;
    } else {
      return {
        ...rule,
        isSnoozed: false,
        start: undefined,
        end: undefined,
      } satisfies RuleWithSnoozeData;
    }
  });

  return rulesWithSnoozeData;
}
