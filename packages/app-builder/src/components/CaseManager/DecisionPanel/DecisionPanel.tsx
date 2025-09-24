import {
  CaseManagerDrawerButtons,
  DrawerContext,
} from '@app-builder/components/CaseManager/Drawer/Drawer';
import { casesI18n } from '@app-builder/components/Cases';
import { CasePivotValues } from '@app-builder/components/Cases/CasePivotValues';
import { RequiredActions } from '@app-builder/components/Cases/RequiredActions';
import { CopyToClipboardButton } from '@app-builder/components/CopyToClipboardButton';
import { IngestedObjectDetailModal } from '@app-builder/components/Data/IngestedObjectDetailModal';
import { OutcomeBadge, RuleExecutionDetail } from '@app-builder/components/Decisions';
import {
  RuleExecutionCollapsible,
  RuleExecutionContent,
  RuleExecutionDescription,
  RuleExecutionTitle,
  RulesExecutionsContainer,
} from '@app-builder/components/Decisions/RulesExecutions/RulesExecutions';
import { CaseDetailTriggerObject } from '@app-builder/components/Decisions/TriggerObjectDetail';
import { ScoreModifier } from '@app-builder/components/Scenario/Rules/ScoreModifier';
import useIntersection from '@app-builder/hooks/useIntersection';
import { type Pivot, type TableModel } from '@app-builder/models';
import { DetailedCaseDecision } from '@app-builder/models/cases';
import { DecisionDetails } from '@app-builder/models/decision';
import { useDetailDecisionQuery } from '@app-builder/queries/decisions/detail-decision';
import { useScenarioIterationRules } from '@app-builder/queries/scenarios/scenario-iteration-rules';
import { type loader } from '@app-builder/routes/_builder+/cases+/$caseId+/_index';
import { useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { filter, isNonNullish, map, pipe } from 'remeda';
import { match } from 'ts-pattern';
import { Button, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from 'ui-design-system';
import { Icon } from 'ui-icons';

type DecisionPanelProps = {
  setDrawerContentMode: (mode: 'pivot' | 'decision' | 'snooze') => void;
  decision: DetailedCaseDecision;
};

type DetailProps = {
  decision: DecisionDetails;
  pivots: Pivot[];
};

const DecisionRuleExecutions = ({ decision }: { decision: DecisionDetails }) => {
  const { t } = useTranslation(casesI18n);
  const [showHitOnly, setShowHitOnly] = useState(true);
  const scenarioIterationRules = useScenarioIterationRules(decision.scenario.scenarioIterationId);

  const filteredRuleExecutions = useMemo(() => {
    if (showHitOnly) {
      return decision.rules.filter((ruleExecution) => ruleExecution.outcome === 'hit');
    }
    return decision.rules;
  }, [decision.rules, showHitOnly]);

  if (scenarioIterationRules.isPending) {
    return <div>Loading...</div>;
  }

  if (scenarioIterationRules.isError) {
    return <div>Error</div>;
  }

  return (
    <div className="flex h-fit flex-2 flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-m text-grey-00 font-semibold">{t('cases:decisions.rules')}</span>
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
                  scenarioId={decision.scenario.id}
                  key={ruleExecution.ruleId}
                  ruleExecution={ruleExecution}
                  rules={scenarioIterationRules.data.rules}
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
  decision,
  pivots,
  dataModel,
}: DetailProps & {
  dataModel: TableModel[];
}) => {
  const { t } = useTranslation(casesI18n);

  const [objectLink, setObjectLink] = useState<{
    tableName: string;
    objectId: string;
  } | null>(null);

  const pivotValues = useMemo(() => {
    return pipe(
      decision.pivotValues,
      map(({ id, value }) => {
        if (!id || !value) return null;
        const pivot = pivots.find((p) => p.id === id);
        if (!pivot) return null;
        return {
          pivot,
          value,
        };
      }),
      filter(isNonNullish),
    );
  }, [decision.pivotValues, pivots]);

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
          triggerObject={decision.triggerObject}
          triggerObjectType={decision.triggerObjectType}
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

const DecisionDetailSkeleton = ({ isExpanded }: { isExpanded: boolean }) => (
  <div className="flex h-fit flex-col gap-6">
    <div className="flex flex-row items-center justify-between gap-2">
      <div className="bg-grey-90 h-8 w-46 animate-pulse rounded-md" />
    </div>
    <div className="flex gap-6 flex-1">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-row justify-between gap-2">
          <div className="bg-grey-90 h-6 w-32 animate-pulse rounded-md" />
          <div className="bg-grey-90 h-6 w-32 animate-pulse rounded-md" />
        </div>
        <div className="bg-grey-90 h-30 w-full animate-pulse rounded-md" />
      </div>
      {isExpanded ? (
        <div className="bg-grey-90 h-60 w-115 shrink-0 animate-pulse rounded-md" />
      ) : null}
    </div>
  </div>
);

const ExpandedDetail = ({
  decision,
  pivots,
  dataModel,
}: DetailProps & { dataModel: TableModel[] }) => {
  return (
    <div className="flex flex-row gap-6">
      <DecisionRuleExecutions decision={decision} />
      <DecisionTriggerObject decision={decision} pivots={pivots} dataModel={dataModel} />
    </div>
  );
};

const CollapsedDetail = ({
  decision,
  pivots,
  dataModel,
}: DetailProps & { dataModel: TableModel[] }) => {
  const { t } = useTranslation(casesI18n);
  return (
    <Tabs defaultValue="hits" className="flex flex-col items-start gap-6">
      <TabsList>
        <TabsTrigger value="hits">{t('cases:decisions.rules')}</TabsTrigger>
        <TabsTrigger value="trigger">{t('cases:case_detail.trigger_object')}</TabsTrigger>
      </TabsList>
      <TabsContent value="hits" className="w-full">
        <DecisionRuleExecutions decision={decision} />
      </TabsContent>
      <TabsContent value="trigger" className="w-full">
        <DecisionTriggerObject decision={decision} pivots={pivots} dataModel={dataModel} />
      </TabsContent>
    </Tabs>
  );
};

export function DecisionPanel({ setDrawerContentMode, decision }: DecisionPanelProps) {
  const { t } = useTranslation(casesI18n);
  const { pivots, dataModelWithTableOptions, case: caseDetail } = useLoaderData<typeof loader>();
  const { isExpanded, setExpanded, container } = DrawerContext.useValue();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(sentinelRef, {
    root: container.current,
    rootMargin: '1px',
    threshold: 1,
  });
  const detailDecisionQuery = useDetailDecisionQuery(decision.id);
  const [shouldDisplaySkeleton, setShouldDisplaySkeleton] = useState(false);

  useEffect(() => {
    setShouldDisplaySkeleton(false);
    const timeout = setTimeout(() => {
      setShouldDisplaySkeleton(true);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [decision.id]);

  return (
    <>
      <div ref={sentinelRef} />
      <div
        className={clsx('bg-grey-100 sticky top-0 z-10 flex items-center pl-4', {
          'shadow-sticky-top': !intersection?.isIntersecting,
        })}
      >
        <Button
          variant="secondary"
          size="small"
          onClick={() => {
            setExpanded(false);
            setDrawerContentMode('pivot');
          }}
        >
          <Icon icon="left-panel-close" className="size-5" />
        </Button>
        <CaseManagerDrawerButtons expandable={true} />
      </div>
      <div className="flex flex-col pl-4 pr-2">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="text-l text-grey-00 font-semibold">{decision.scenario.name}</span>
            <ScoreModifier score={decision.score} />
          </div>
          <div className="flex flex-col items-start gap-2">
            <div className="grid grid-cols-[60px_1fr] items-center">
              <span className="text-grey-50 text-xs">Id</span>
              <CopyToClipboardButton size="sm" toCopy={decision.id}>
                <span className="line-clamp-1 max-w-40 text-xs font-normal">{decision.id}</span>
              </CopyToClipboardButton>
            </div>
            <div className="grid grid-cols-[60px_1fr] items-center">
              <span className="text-grey-50 text-xs">{t('cases:decisions.outcome')}</span>
              <OutcomeBadge outcome={decision.outcome} reviewStatus={decision.reviewStatus} />
            </div>
            <RequiredActions decision={decision} caseId={caseDetail.id} />
          </div>
          {match(detailDecisionQuery)
            .with({ isPending: true }, () =>
              shouldDisplaySkeleton ? <DecisionDetailSkeleton isExpanded={isExpanded} /> : null,
            )
            .with({ isError: true }, () => <div>Error</div>)
            .otherwise(({ data: decisionWithRules }) =>
              isExpanded ? (
                <ExpandedDetail
                  decision={decisionWithRules.decision}
                  pivots={pivots}
                  dataModel={dataModelWithTableOptions}
                />
              ) : (
                <CollapsedDetail
                  decision={decisionWithRules.decision}
                  pivots={pivots}
                  dataModel={dataModelWithTableOptions}
                />
              ),
            )}
        </div>
      </div>
    </>
  );
}
