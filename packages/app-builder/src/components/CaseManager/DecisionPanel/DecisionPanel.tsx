import { DrawerContext } from '@app-builder/components/CaseManager/Drawer/Drawer';
import { casesI18n } from '@app-builder/components/Cases';
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
import { ScoreModifier } from '@app-builder/components/Scenario/Rules/ScoreModifier';
import { Spinner } from '@app-builder/components/Spinner';
import { type DetailedCaseDecision } from '@app-builder/models/cases';
import { type ScreeningStatus } from '@app-builder/models/screening';
import { useDetailDecisionQuery } from '@app-builder/queries/decisions/detail-decision';
import { useScenarioIterationRules } from '@app-builder/queries/scenarios/scenario-iteration-rules';
import { type loader } from '@app-builder/routes/_builder+/cases+/_detail+/s.$caseId';
import { ReviewDecisionModal } from '@app-builder/routes/ressources+/cases+/review-decision';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link, useLoaderData } from '@remix-run/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Switch, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

const screeningTagColor: Record<ScreeningStatus, 'yellow' | 'green' | 'red' | 'grey'> = {
  in_review: 'yellow',
  no_hit: 'green',
  confirmed_hit: 'red',
  error: 'grey',
};

type DecisionPanelProps = {
  setDrawerContentMode: (mode: 'pivot' | 'decision' | 'snooze') => void;
  decision: DetailedCaseDecision;
};

export function DecisionPanel({ setDrawerContentMode, decision }: DecisionPanelProps) {
  const { t } = useTranslation(casesI18n);
  const { dataModelWithTableOptions, case: caseDetail } = useLoaderData<typeof loader>();
  const { setExpanded } = DrawerContext.useValue();
  const detailDecisionQuery = useDetailDecisionQuery(decision.id);

  const [showHitOnly, setShowHitOnly] = useState(true);
  const [objectLink, setObjectLink] = useState<{
    tableName: string;
    objectId: string;
  } | null>(null);

  const isPendingReview = decision.outcome === 'block_and_review' && decision.reviewStatus === 'pending';

  const scenarioIterationRules = useScenarioIterationRules(
    detailDecisionQuery.data?.decision.scenario.scenarioIterationId ?? '',
  );

  const filteredRuleExecutions = useMemo(() => {
    if (!detailDecisionQuery.data) return [];
    const rules = detailDecisionQuery.data.decision.rules;
    if (showHitOnly) {
      return rules.filter((r) => r.outcome === 'hit');
    }
    return rules;
  }, [detailDecisionQuery.data, showHitOnly]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          mode="icon"
          size="small"
          onClick={() => {
            setExpanded(false);
            setDrawerContentMode('pivot');
          }}
        >
          <Icon icon="cross" className="size-5" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-l text-grey-primary font-semibold">{decision.scenario.name}</span>
            <ScoreModifier score={decision.score} />
          </div>
          {isPendingReview ? (
            <ReviewDecisionModal decisionId={decision.id} screening={decision.screenings[0]}>
              <Button variant="primary" size="small">
                {t('cases:decisions.approve_or_decline')}
              </Button>
            </ReviewDecisionModal>
          ) : null}
        </div>
      </div>

      {/* Screenings Rules */}
      {decision.screenings.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span className="text-m text-grey-primary font-medium">{t('cases:decisions.screenings_rules')}</span>
          <div className="flex flex-col gap-2">
            {decision.screenings.map((screening) => (
              <div key={screening.id} className="flex items-center gap-2">
                <span className="text-grey-placeholder text-xs font-medium">&bull;</span>
                <span className="text-grey-placeholder text-xs font-medium">{screening.name}</span>
                <Link
                  to={getRoute('/cases/:caseId/d/:decisionId/screenings/:screeningId', {
                    caseId: fromUUIDtoSUUID(caseDetail.id),
                    decisionId: fromUUIDtoSUUID(decision.id),
                    screeningId: fromUUIDtoSUUID(screening.id),
                  })}
                >
                  <Tag color={screeningTagColor[screening.status]} size="small">
                    {t(`screenings:status.${screening.status}`)}
                    {screening.status === 'in_review' && screening.count > 0 ? ` (${screening.count})` : ''}
                  </Tag>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Rules */}
      {detailDecisionQuery.isPending ? (
        <div className="flex items-center justify-center p-4">
          <Spinner className="size-8" />
        </div>
      ) : detailDecisionQuery.isError ? (
        <div>Error</div>
      ) : filteredRuleExecutions.length === 0 ? null : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-m text-grey-primary font-medium">{t('cases:decisions.rules')}</span>
            <div className="flex items-center gap-2">
              <label htmlFor="showHitOnly" className="text-grey-primary cursor-pointer select-none text-xs">
                {t('cases:case_detail.rules_execution.show_hit_only')}
              </label>
              <Switch id="showHitOnly" checked={showHitOnly} onCheckedChange={setShowHitOnly} />
            </div>
          </div>
          <RulesExecutionsContainer className="h-fit">
            {filteredRuleExecutions.map((ruleExecution) => (
              <RuleExecutionCollapsible key={ruleExecution.ruleId}>
                <RuleExecutionTitle ruleExecution={ruleExecution} />
                <RuleExecutionContent>
                  <RuleExecutionDescription description={ruleExecution.description} />
                  {scenarioIterationRules.data ? (
                    <RuleExecutionDetail
                      scenarioId={detailDecisionQuery.data.decision.scenario.id}
                      ruleExecution={ruleExecution}
                      rules={scenarioIterationRules.data.rules}
                      isIterationArchived={scenarioIterationRules.data.archived}
                    />
                  ) : null}
                </RuleExecutionContent>
              </RuleExecutionCollapsible>
            ))}
          </RulesExecutionsContainer>
        </div>
      )}

      {/* Trigger Object */}
      {detailDecisionQuery.data ? (
        <div className="flex flex-col gap-2">
          <span className="text-m text-grey-primary font-medium">{t('cases:case_detail.trigger_object')}</span>
          <CaseDetailTriggerObject
            className="max-h-[50dvh] overflow-auto"
            dataModel={dataModelWithTableOptions}
            triggerObject={detailDecisionQuery.data.decision.triggerObject}
            triggerObjectType={detailDecisionQuery.data.decision.triggerObjectType}
            onLinkClicked={(tableName, objectId) => setObjectLink({ tableName, objectId })}
          />
          {objectLink ? (
            <IngestedObjectDetailModal
              dataModel={dataModelWithTableOptions}
              tableName={objectLink.tableName}
              objectId={objectLink.objectId}
              onClose={() => setObjectLink(null)}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
