import { decisionsI18n, Paper } from '@app-builder/components';
import { AstBuilder } from '@app-builder/components/Scenario/AstBuilder/AstBuilder';
import { type AstNode, type DataModel } from '@app-builder/models';
import {
  type DatabaseAccessAstNode,
  type PayloadAstNode,
} from '@app-builder/models/astNode/data-accessor';
import { type CustomList } from '@app-builder/models/custom-list';
import { type RuleExecution } from '@app-builder/models/decision';
import { type OperatorFunction } from '@app-builder/models/operator-functions';
import { type NodeEvaluation } from '@app-builder/models/node-evaluation';
import { type ScenarioIterationRule } from '@app-builder/models/scenario-iteration-rule';
import { useAstNodeEditor } from '@app-builder/services/editor/ast-editor';
import {
  DisplayReturnValuesProvider,
  useDisplayReturnValues,
} from '@app-builder/services/editor/return-value';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Switch } from 'ui-design-system';

export function RuleExecutionDetail({
  ruleExecution,
  triggerObjectType,
  astRuleData,
}: {
  ruleExecution: RuleExecution;
  triggerObjectType: string;
  astRuleData: {
    rules: ScenarioIterationRule[];
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
    operators: OperatorFunction[];
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

  if (!currentRule || !currentRule.formula) {
    return (
      <p className="bg-red-05 text-s flex h-8 items-center justify-center rounded px-2 py-1 font-medium text-red-100">
        {t('decisions:rules.error.not_found')}
      </p>
    );
  }

  return (
    <DisplayReturnValuesProvider>
      <div className="flex w-full items-center justify-between gap-2">
        <div className="bg-purple-10 text-s inline-flex h-8 w-fit items-center justify-center whitespace-pre rounded px-2 font-normal text-purple-100">
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
        {ruleExecution.evaluation ? <DisplayReturnValuesSwitch /> : null}
      </div>

      <RuleFormula
        formula={currentRule.formula}
        evaluation={ruleExecution.evaluation}
        databaseAccessors={astRuleData.databaseAccessors}
        payloadAccessors={astRuleData.payloadAccessors}
        operators={astRuleData.operators}
        dataModel={astRuleData.dataModel}
        customLists={astRuleData.customLists}
        triggerObjectType={triggerObjectType}
      />
    </DisplayReturnValuesProvider>
  );
}

function DisplayReturnValuesSwitch() {
  const { t } = useTranslation(decisionsI18n);
  const [displayReturnValues, setDisplayReturnValues] =
    useDisplayReturnValues();

  const id = React.useId();

  return (
    <div className="flex flex-row justify-between gap-2">
      <label htmlFor={id} className="text-s select-none font-medium">
        {t('decisions:rules.show_contextual_values')}
      </label>
      <Switch
        id={id}
        checked={displayReturnValues}
        onCheckedChange={setDisplayReturnValues}
      />
    </div>
  );
}

function RuleFormula({
  formula,
  databaseAccessors,
  evaluation,
  payloadAccessors,
  operators,
  dataModel,
  customLists,
  triggerObjectType,
}: {
  formula: AstNode;
  evaluation?: NodeEvaluation;
  databaseAccessors: DatabaseAccessAstNode[];
  payloadAccessors: PayloadAstNode[];
  operators: OperatorFunction[];
  dataModel: DataModel;
  customLists: CustomList[];
  triggerObjectType: string;
}) {
  const astEditorStore = useAstNodeEditor({
    initialAstNode: formula,
    initialEvaluation: evaluation,
  });
  return (
    <Paper.Container className="bg-grey-00">
      <AstBuilder
        options={{
          databaseAccessors,
          payloadAccessors,
          operators,
          dataModel,
          customLists,
          triggerObjectType,
        }}
        astEditorStore={astEditorStore}
        viewOnly={true}
      />
    </Paper.Container>
  );
}
