import { casesI18n } from '@app-builder/components/Cases';
import { AlertOutcomeIcon, ScreeningStatusBadge } from '@app-builder/components/Cases/CaseAlerts';
import { CopyToClipboardButton } from '@app-builder/components/CopyToClipboardButton';
import { IngestedObjectDetailModal } from '@app-builder/components/Data/IngestedObjectDetailModal';
import { RuleExecutionDetail } from '@app-builder/components/Decisions';
import { ReviewDecisionModal } from '@app-builder/components/Decisions/ReviewDecisionModal';
import {
  RuleExecutionCollapsible,
  RuleExecutionContent,
  RuleExecutionDescription,
  RuleExecutionTitle,
  RulesExecutionsContainer,
} from '@app-builder/components/Decisions/RulesExecutions/RulesExecutions';
import { CaseDetailTriggerObject } from '@app-builder/components/Decisions/TriggerObjectDetail';
import { Panel } from '@app-builder/components/Panel';
import { ScoreModifier } from '@app-builder/components/Scenario/Rules/ScoreModifier';
import { Spinner } from '@app-builder/components/Spinner';
import { DataModel } from '@app-builder/models';
import { type DetailedCaseDecision } from '@app-builder/models/cases';
import { useDetailDecisionQuery } from '@app-builder/queries/decisions/detail-decision';
import { useScenarioIterationRules } from '@app-builder/queries/scenarios/scenario-iteration-rules';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Switch } from 'ui-design-system';

type DecisionPanelProps = {
  decision: DetailedCaseDecision;
  dataModel: DataModel;
  onClose: () => void;
  onScreeningSelect: (screeningId: string) => void;
};

export function DecisionPanel({ decision, dataModel, onClose, onScreeningSelect }: DecisionPanelProps) {
  const { t } = useTranslation(casesI18n);
  const detailDecisionQuery = useDetailDecisionQuery(decision.id);

  const [showHitOnly, setShowHitOnly] = useState(true);
  // Defensive default — see CaseAlerts.tsx for rationale.
  const screenings = decision.screenings ?? [];
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
    <Panel.Content>
      {/* Header */}
      <Panel.Header>
        <div className="flex flex-1 flex-col gap-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <AlertOutcomeIcon outcome={decision.outcome} reviewStatus={decision.reviewStatus} showLabel={false} />
              <span className="text-grey-primary font-semibold">{decision.scenario.name}</span>
              <ScoreModifier score={decision.score} />
            </div>
            {isPendingReview ? (
              <ReviewDecisionModal decisionId={decision.id} screening={screenings[0]}>
                <Button variant="primary" size="small">
                  {t('cases:decisions.approve_or_decline')}
                </Button>
              </ReviewDecisionModal>
            ) : null}
          </div>
          <CopyToClipboardButton size="sm" toCopy={decision.id}>
            <span className="text-xs font-normal">
              <span className="font-medium">ID</span> {decision.id}
            </span>
          </CopyToClipboardButton>
        </div>
      </Panel.Header>

      <div className="flex flex-col gap-md">
        {/* Screenings Rules */}
        {screenings.length > 0 ? (
          <div className="flex flex-col gap-sm">
            <span className="text-m text-grey-primary font-medium">{t('cases:decisions.screenings_rules')}</span>
            <div className="flex flex-col gap-sm">
              {screenings.map((screening) => (
                <div key={screening.id} className="flex items-center gap-sm">
                  <span className="text-grey-placeholder text-xs font-medium">&bull;</span>
                  <span className="text-grey-placeholder text-xs font-medium">{screening.name}</span>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onScreeningSelect(screening.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        onScreeningSelect(screening.id);
                      }
                    }}
                  >
                    <ScreeningStatusBadge
                      status={screening.status}
                      decisionId={decision.id}
                      screeningId={screening.id}
                      nbHits={screening.count}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Rules */}
        {match(detailDecisionQuery)
          .with({ isPending: true }, () => (
            <div className="flex items-center justify-center p-md">
              <Spinner className="size-8" />
            </div>
          ))
          .with({ isError: true }, () => (
            <div className="text-grey-secondary p-md text-center text-xs">{t('common:global_error')}</div>
          ))
          .otherwise(() => {
            const allRules = detailDecisionQuery.data?.decision.rules ?? [];
            if (allRules.length === 0) return null;

            return (
              <div className="flex flex-col gap-sm">
                <div className="flex items-center justify-between">
                  <span className="text-m text-grey-primary font-medium">{t('cases:decisions.rules')}</span>
                  <div className="flex items-center gap-sm">
                    <label htmlFor="showHitOnly" className="text-grey-primary cursor-pointer select-none text-xs">
                      {t('cases:case_detail.rules_execution.show_hit_only')}
                    </label>
                    <Switch id="showHitOnly" checked={showHitOnly} onCheckedChange={setShowHitOnly} />
                  </div>
                </div>
                {filteredRuleExecutions.length > 0 ? (
                  <RulesExecutionsContainer className="h-fit">
                    {filteredRuleExecutions.map((ruleExecution) => (
                      <RuleExecutionCollapsible key={ruleExecution.ruleId}>
                        <RuleExecutionTitle ruleExecution={ruleExecution} />
                        <RuleExecutionContent>
                          <RuleExecutionDescription description={ruleExecution.description} />
                          {scenarioIterationRules.data ? (
                            <RuleExecutionDetail
                              scenarioId={detailDecisionQuery.data?.decision.scenario.id ?? ''}
                              ruleExecution={ruleExecution}
                              rules={scenarioIterationRules.data.rules}
                              isIterationArchived={scenarioIterationRules.data.archived}
                            />
                          ) : null}
                        </RuleExecutionContent>
                      </RuleExecutionCollapsible>
                    ))}
                  </RulesExecutionsContainer>
                ) : null}
              </div>
            );
          })}

        {/* Trigger Object */}
        {detailDecisionQuery.data ? (
          <div className="flex flex-col gap-sm">
            <span className="text-m text-grey-primary font-medium">{t('cases:case_detail.trigger_object')}</span>
            <CaseDetailTriggerObject
              className="max-h-[50dvh] overflow-auto"
              dataModel={dataModel}
              triggerObject={detailDecisionQuery.data.decision.triggerObject}
              triggerObjectType={detailDecisionQuery.data.decision.triggerObjectType}
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
        ) : null}
      </div>
    </Panel.Content>
  );
}
