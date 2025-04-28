import {
  CaseManagerDrawerButtons,
  DrawerContext,
} from '@app-builder/components/CaseManager/Drawer/Drawer';
import { casesI18n } from '@app-builder/components/Cases';
import { CasePivotValues } from '@app-builder/components/Cases/CasePivotValues';
import { RequiredActions } from '@app-builder/components/Cases/RequiredActions';
import { IngestedObjectDetailModal } from '@app-builder/components/Data/IngestedObjectDetailModal';
import { RuleExecutionDetail } from '@app-builder/components/Decisions';
import {
  RuleExecutionCollapsible,
  RuleExecutionContent,
  RuleExecutionDescription,
  RuleExecutionTitle,
  RulesExecutionsContainer,
} from '@app-builder/components/Decisions/RulesExecutions/RulesExecutions';
import { CaseDetailTriggerObject } from '@app-builder/components/Decisions/TriggerObjectDetail';
import { type Pivot, type TableModel } from '@app-builder/models';
import {
  type DatabaseAccessAstNode,
  type PayloadAstNode,
} from '@app-builder/models/astNode/data-accessor';
import { type CustomList } from '@app-builder/models/custom-list';
import { type Decision, type RuleExecution } from '@app-builder/models/decision';
import { type ScenarioIterationRule } from '@app-builder/models/scenario-iteration-rule';
import { type loader } from '@app-builder/routes/_builder+/cases+/$caseId+/_index';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { filter, isNonNullish, map, pipe } from 'remeda';
import { match } from 'ts-pattern';
import { Button, cn, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from 'ui-design-system';
import { Icon } from 'ui-icons';

type DecisionPanelProps = {
  decisionId: string;
  selectDecision: (id: string | null) => void;
};

type Detail = Pick<Decision, 'pivotValues' | 'scenario' | 'triggerObject' | 'triggerObjectType'> & {
  pivots: Pivot[];
  ruleExecutions: RuleExecution[];
  scenarioRules: ScenarioIterationRule[];
  accessors: {
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
  };
};

const DecisionRuleExecutions = ({
  detail,
  dataModel,
  customLists,
}: {
  detail: Detail;
  dataModel: TableModel[];
  customLists: CustomList[];
}) => {
  const { t } = useTranslation(casesI18n);
  const [showHitOnly, setShowHitOnly] = useState(true);

  const filteredRuleExecutions = useMemo(() => {
    if (!detail?.ruleExecutions) return [];
    if (showHitOnly) {
      return detail.ruleExecutions.filter((ruleExecution) => ruleExecution.outcome === 'hit');
    }
    return detail.ruleExecutions;
  }, [detail?.ruleExecutions, showHitOnly]);

  return (
    <div className="flex h-fit flex-[2] flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-m text-grey-00 font-semibold">Hits</span>
        <div className="flex flex-row items-center gap-4">
          <label htmlFor="showHitOnly" className="text-grey-00 cursor-pointer select-none text-xs">
            {t('cases:case_detail.rules_execution.show_hit_only')}
          </label>
          <Switch id="showHitOnly" checked={showHitOnly} onCheckedChange={setShowHitOnly} />
        </div>
      </div>

      <RulesExecutionsContainer className="h-fit">
        {filteredRuleExecutions.map((ruleExecution) => {
          return (
            <RuleExecutionCollapsible key={ruleExecution.ruleId}>
              <RuleExecutionTitle ruleExecution={ruleExecution} />
              <RuleExecutionContent>
                <RuleExecutionDescription description={ruleExecution.description} />

                <RuleExecutionDetail
                  scenarioId={detail.scenario.id}
                  key={ruleExecution.ruleId}
                  ruleExecution={ruleExecution}
                  triggerObjectType={detail.triggerObjectType}
                  astRuleData={{
                    dataModel,
                    customLists,
                    ...detail.accessors,
                    rules: detail.scenarioRules,
                  }}
                />
              </RuleExecutionContent>
            </RuleExecutionCollapsible>
          );
        })}
      </RulesExecutionsContainer>
    </div>
  );
};

const DecisionTriggerObject = ({
  detail,
  dataModel,
}: {
  detail: Pick<Decision, 'pivotValues' | 'triggerObject' | 'triggerObjectType'> & {
    pivots: Pivot[];
  };
  dataModel: TableModel[];
}) => {
  const { t } = useTranslation(casesI18n);

  const [objectLink, setObjectLink] = useState<{
    tableName: string;
    objectId: string;
  } | null>(null);

  const pivotValues = useMemo(() => {
    return pipe(
      detail.pivotValues,
      map(({ id, value }) => {
        if (!id || !value) return null;
        const pivot = detail?.pivots.find((p) => p.id === id);
        if (!pivot) return null;
        return {
          pivot,
          value,
        };
      }),
      filter(isNonNullish),
    );
  }, [detail.pivotValues, detail.pivots]);

  return (
    <div className="sticky top-0 flex h-fit flex-1 flex-col gap-6">
      <div className="flex h-fit flex-col gap-4">
        <span className="text-m text-grey-00 font-semibold">
          {t('cases:case_detail.trigger_object')}
        </span>
        <div className="flex flex-col gap-2">
          <span className="text-grey-50 text-xs first-letter:capitalize">
            {t('cases:case_detail.pivot_values')}
          </span>
          <CasePivotValues pivotValues={pivotValues} />
        </div>
      </div>

      <div className="flex h-fit flex-col gap-2">
        <span className="text-grey-50 text-xs first-letter:capitalize">
          {t('cases:case_detail.trigger_object')}
        </span>
        <CaseDetailTriggerObject
          className="h-fit max-h-[50dvh] overflow-auto"
          dataModel={dataModel}
          triggerObject={detail.triggerObject}
          triggerObjectType={detail.triggerObjectType}
          onLinkClicked={(tableName, objectId) => setObjectLink({ tableName, objectId })}
        />
        {objectLink ? (
          <IngestedObjectDetailModal
            dataModel={dataModel}
            tableName={objectLink.tableName}
            objectId={objectLink.objectId}
            onClose={() => setObjectLink(null)}
          />
        ) : null}
      </div>
    </div>
  );
};

const DecisionDetailSkeleton = () => (
  <div className="flex flex-row gap-6 p-4">
    <div className="flex h-fit flex-[2] flex-col gap-2">
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="bg-grey-90 h-4 w-32 animate-pulse rounded-md" />
        <div className="bg-grey-90 h-4 w-32 animate-pulse rounded-md" />
      </div>
      <div className="bg-grey-90 h-12 animate-pulse rounded-lg" />
      <div className="bg-grey-90 h-12 animate-pulse rounded-lg" />
      <div className="bg-grey-90 h-12 animate-pulse rounded-lg" />
    </div>

    <div className="flex h-fit flex-1 flex-col gap-6">
      <div className="flex h-fit flex-col gap-2">
        <div className="col-start-2 row-start-1 flex flex-row items-center justify-between gap-2">
          <div className="bg-grey-90 h-4 w-32 animate-pulse rounded-md" />
        </div>
        <div className="bg-grey-90 h-8 w-full animate-pulse rounded-md" />
      </div>

      <div className="flex h-fit flex-col gap-2">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="bg-grey-90 h-4 w-32 animate-pulse rounded-md" />
        </div>
        <div className="bg-grey-90 h-60 w-full animate-pulse rounded-md" />
      </div>
    </div>
  </div>
);

const ExpandedDetail = ({
  detail,
  dataModel,
  customLists,
}: {
  detail: Detail;
  dataModel: TableModel[];
  customLists: CustomList[];
}) => {
  return (
    <div className="flex flex-row gap-6">
      <DecisionRuleExecutions detail={detail} dataModel={dataModel} customLists={customLists} />
      <DecisionTriggerObject detail={detail} dataModel={dataModel} />
    </div>
  );
};

const CollapsedDetail = ({
  detail,
  dataModel,
  customLists,
}: {
  detail: Detail;
  dataModel: TableModel[];
  customLists: CustomList[];
}) => {
  return (
    <Tabs defaultValue="hits" className="flex flex-col items-start gap-6">
      <TabsList>
        <TabsTrigger value="hits">Hits</TabsTrigger>
        <TabsTrigger value="trigger">Trigger</TabsTrigger>
      </TabsList>
      <TabsContent value="hits" className="w-full">
        <DecisionRuleExecutions detail={detail} dataModel={dataModel} customLists={customLists} />
      </TabsContent>
      <TabsContent value="trigger" className="w-full">
        <DecisionTriggerObject detail={detail} dataModel={dataModel} />
      </TabsContent>
    </Tabs>
  );
};

export function DecisionPanel({ selectDecision, decisionId }: DecisionPanelProps) {
  const { decisionsPromise, pivots, dataModel, customLists } = useLoaderData<typeof loader>();
  const { isExpanded, setExpanded } = DrawerContext.useValue();

  return (
    <div className="flex flex-col pl-4">
      <div className="sticky top-0 z-10 flex items-center">
        <Button
          variant="secondary"
          size="small"
          onClick={() => {
            setExpanded(false);
            selectDecision(null);
          }}
        >
          <Icon icon="left-panel-close" className="size-4" />
        </Button>
        <CaseManagerDrawerButtons expandable={true} />
      </div>

      <Suspense fallback={<DecisionDetailSkeleton />}>
        <Await resolve={decisionsPromise}>
          {(decisions) => {
            const decision = decisions.find((d) => d.id === decisionId);

            if (!decision) return <DecisionDetailSkeleton />;

            return (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-l text-grey-00 font-semibold">
                    {decision.scenario.name}
                  </span>
                  <span className="bg-purple-96 text-purple-65 rounded-full px-2 py-[3px] text-xs font-normal">
                    +{decision.score}
                  </span>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-grey-50 text-xs">Current statut</span>
                    <div className="flex items-center gap-1">
                      <div
                        className={cn('size-4 rounded-full', {
                          'bg-green-38': decision.outcome === 'approve',
                          'bg-red-47': decision.outcome === 'decline',
                          'border-red-47 border-2': decision.outcome === 'review',
                          'border-2 border-yellow-50': decision.outcome === 'block_and_review',
                          'bg-grey-50': decision.outcome === 'unknown',
                        })}
                      />
                      <span className="text-xs font-medium">
                        {match(decision.outcome)
                          .with('approve', () => 'Manually approved')
                          .with('decline', () => 'Manually declined')
                          .with('block_and_review', () => 'Blocked and review')
                          .with('review', () => 'Review')
                          .with('unknown', () => 'Unknown')
                          .exhaustive()}
                      </span>
                    </div>
                  </div>
                  <RequiredActions decision={decision} />
                </div>
                {isExpanded ? (
                  <ExpandedDetail
                    detail={{ ...decision, pivots }}
                    dataModel={dataModel}
                    customLists={customLists}
                  />
                ) : (
                  <CollapsedDetail
                    detail={{ ...decision, pivots }}
                    dataModel={dataModel}
                    customLists={customLists}
                  />
                )}
              </div>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}
