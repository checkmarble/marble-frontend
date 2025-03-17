import { decisionsI18n, Paper } from '@app-builder/components';
import { type AstNode, type DataModel } from '@app-builder/models';
import {
  type DatabaseAccessAstNode,
  type PayloadAstNode,
} from '@app-builder/models/astNode/data-accessor';
import { type CustomList } from '@app-builder/models/custom-list';
import { type RuleExecution } from '@app-builder/models/decision';
import { NewNodeEvaluation, type NodeEvaluation } from '@app-builder/models/node-evaluation';
import { type ScenarioIterationRule } from '@app-builder/models/scenario-iteration-rule';
import { generateFlatEvaluation } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/validate-ast';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { Await } from '@remix-run/react';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Collapsible, Switch } from 'ui-design-system';

import { AstBuilder } from '../AstBuilder';
import {
  RuleExecutionCollapsible,
  RuleExecutionContent,
  RuleExecutionDescription,
  RuleExecutionTitle,
  RulesExecutionsContainer,
} from './RulesExecutions/RulesExecutions';

export function RulesDetail({
  scenarioId,
  ruleExecutions,
  triggerObjectType,
  astRuleData,
}: {
  scenarioId: string;
  ruleExecutions: RuleExecution[];
  triggerObjectType: string;
  astRuleData: Promise<{
    rules: ScenarioIterationRule[];
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
    dataModel: DataModel;
    customLists: CustomList[];
  }>;
}) {
  const { t } = useTranslation(decisionsI18n);

  return (
    <Collapsible.Container className="bg-grey-100">
      <Collapsible.Title>{t('decisions:rules.title')}</Collapsible.Title>
      <Collapsible.Content>
        <RulesExecutionsContainer>
          {ruleExecutions.map((ruleExecution) => {
            return (
              <RuleExecutionCollapsible key={ruleExecution.ruleId}>
                <RuleExecutionTitle ruleExecution={ruleExecution} />
                <RuleExecutionContent>
                  <RuleExecutionDescription description={ruleExecution.description} />

                  <React.Suspense fallback={t('common:loading')}>
                    <Await resolve={astRuleData}>
                      {(astRuleData) => (
                        <RuleExecutionDetail
                          scenarioId={scenarioId}
                          ruleExecution={ruleExecution}
                          triggerObjectType={triggerObjectType}
                          astRuleData={astRuleData}
                        />
                      )}
                    </Await>
                  </React.Suspense>
                </RuleExecutionContent>
              </RuleExecutionCollapsible>
            );
          })}
        </RulesExecutionsContainer>
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

export function RuleExecutionDetail({
  scenarioId,
  ruleExecution,
  triggerObjectType,
  astRuleData,
}: {
  scenarioId: string;
  ruleExecution: RuleExecution;
  triggerObjectType: string;
  astRuleData: {
    rules: ScenarioIterationRule[];
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
    dataModel: DataModel;
    customLists: CustomList[];
  };
}) {
  const { t } = useTranslation(decisionsI18n);
  const language = useFormatLanguage();
  const currentRule = React.useMemo(
    () => astRuleData.rules.find((rule) => rule.id === ruleExecution.ruleId),
    [astRuleData.rules, ruleExecution.ruleId],
  );
  const [showValues, setShowValues] = React.useState(false);

  if (!currentRule || !currentRule.formula) {
    return (
      <p className="bg-red-95 text-s text-red-47 flex h-8 items-center justify-center rounded px-2 py-1 font-medium">
        {t('decisions:rules.error.not_found')}
      </p>
    );
  }

  return (
    <>
      <div className="flex w-full items-center justify-between gap-2">
        <div className="bg-purple-96 text-s text-purple-65 inline-flex h-8 w-fit items-center justify-center whitespace-pre rounded px-2 font-normal">
          <Trans
            t={t}
            i18nKey="scenarios:rules.consequence.score_modifier"
            components={{
              Score: <span className="font-semibold" />,
            }}
            values={{
              score: formatNumber(currentRule.scoreModifier, {
                language,
                signDisplay: 'always',
              }),
            }}
          />
        </div>
        {ruleExecution.evaluation ? (
          <DisplayReturnValuesSwitch value={showValues} onChange={setShowValues} />
        ) : null}
      </div>

      <RuleFormula
        scenarioId={scenarioId}
        formula={currentRule.formula}
        evaluation={ruleExecution.evaluation}
        databaseAccessors={astRuleData.databaseAccessors}
        payloadAccessors={astRuleData.payloadAccessors}
        dataModel={astRuleData.dataModel}
        customLists={astRuleData.customLists}
        triggerObjectType={triggerObjectType}
        showValues={showValues}
      />
    </>
  );
}

function DisplayReturnValuesSwitch({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { t } = useTranslation(decisionsI18n);

  const id = React.useId();

  return (
    <div className="flex flex-row justify-between gap-2">
      <label htmlFor={id} className="text-s select-none font-medium">
        {t('decisions:rules.show_contextual_values')}
      </label>
      <Switch id={id} checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function RuleFormula({
  scenarioId,
  formula,
  databaseAccessors,
  evaluation,
  payloadAccessors,
  dataModel,
  customLists,
  triggerObjectType,
  showValues,
}: {
  scenarioId: string;
  formula: AstNode;
  evaluation?: NodeEvaluation;
  databaseAccessors: DatabaseAccessAstNode[];
  payloadAccessors: PayloadAstNode[];
  dataModel: DataModel;
  customLists: CustomList[];
  triggerObjectType: string;
  showValues: boolean;
}) {
  const flatEvaluation = React.useMemo(
    () => generateFlatEvaluation(formula, evaluation ?? NewNodeEvaluation()),
    [formula, evaluation],
  );
  return (
    <Paper.Container className="bg-grey-100">
      <AstBuilder.Provider
        scenarioId={scenarioId}
        initialData={{
          customLists,
          dataModel,
          databaseAccessors,
          payloadAccessors,
          triggerObjectType,
        }}
        mode="view"
        showValues={showValues}
      >
        <AstBuilder.Root node={formula} evaluation={flatEvaluation} />
      </AstBuilder.Provider>
    </Paper.Container>
  );
}
