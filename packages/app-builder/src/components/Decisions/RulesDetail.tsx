import { Callout, decisionsI18n, Paper } from '@app-builder/components';
import { Score } from '@app-builder/components/Decisions/Score';
import {
  type AstNode,
  type AstOperator,
  type DatabaseAccessAstNode,
  type PayloadAstNode,
  type ScenarioIterationRule,
  type TableModel,
} from '@app-builder/models';
import { type RuleExecution } from '@app-builder/models/decision';
import { useAstBuilder } from '@app-builder/services/editor/ast-editor';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { Await } from '@remix-run/react';
import { type CustomList } from 'marble-api';
import { Suspense, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Accordion, Collapsible, Tag } from 'ui-design-system';

import { AstBuilder } from '../Scenario/AstBuilder';

export function RulesDetail({
  ruleExecutions,
  triggerObjectType,
  astRuleData,
}: {
  ruleExecutions: RuleExecution[];
  triggerObjectType: string;
  astRuleData: Promise<{
    rules: ScenarioIterationRule[];
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
    astOperators: AstOperator[];
    dataModel: TableModel[];
    customLists: CustomList[];
  }>;
}) {
  const { t } = useTranslation(decisionsI18n);

  return (
    <Collapsible.Container className="bg-grey-00">
      <Collapsible.Title>{t('decisions:rules.title')}</Collapsible.Title>
      <Collapsible.Content>
        <Accordion.Container>
          {ruleExecutions.map((ruleExecution) => {
            const isTriggered = ruleExecution.status === 'triggered';

            const title = (
              <div className="flex grow items-center justify-between">
                <div className="text-s flex items-center gap-2 font-semibold">
                  {ruleExecution.name}
                  {isTriggered ? (
                    <Score score={ruleExecution.scoreModifier} />
                  ) : null}
                </div>
                {ruleExecution.status ? (
                  <Tag
                    border="square"
                    size="big"
                    color={isTriggered ? 'green' : 'red'}
                    className="capitalize"
                  >
                    {t(`decisions:rules.status.${ruleExecution.status}`)}
                  </Tag>
                ) : null}
              </div>
            );

            return (
              <Accordion.Item
                key={ruleExecution.ruleId}
                value={ruleExecution.ruleId}
                className="border-grey-10 overflow-hidden rounded border"
              >
                <Accordion.Title className="flex flex-1 items-center justify-between gap-4 p-4">
                  {title}
                  <Accordion.Arrow />
                </Accordion.Title>
                <Accordion.Content className="bg-purple-02 border-grey-10 border-t">
                  <div className="flex flex-col gap-4 p-4">
                    {ruleExecution.description ? (
                      <Callout variant="outlined">
                        {ruleExecution.description}
                      </Callout>
                    ) : null}

                    <Suspense fallback={t('common:loading')}>
                      <Await resolve={astRuleData}>
                        {(astRuleData) => (
                          <RuleExecutionDetail
                            ruleExecution={ruleExecution}
                            triggerObjectType={triggerObjectType}
                            astRuleData={astRuleData}
                          />
                        )}
                      </Await>
                    </Suspense>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            );
          })}
        </Accordion.Container>
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

function RuleExecutionDetail({
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
    astOperators: AstOperator[];
    dataModel: TableModel[];
    customLists: CustomList[];
  };
}) {
  const { t } = useTranslation(decisionsI18n);
  const language = useFormatLanguage();
  const currentRule = useMemo(
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
    <>
      <div className="bg-purple-10 inline-flex h-8 w-fit items-center justify-center whitespace-pre rounded px-2 font-normal text-purple-100">
        <Trans
          t={t}
          i18nKey="scenarios:rules.consequence.score_modifier"
          components={{
            Score: <span className="font-semibold" />,
          }}
          values={{
            score: formatNumber(currentRule?.scoreModifier, {
              language,
              signDisplay: 'always',
            }),
          }}
        />
      </div>

      <RuleFormula
        formula={currentRule.formula}
        databaseAccessors={astRuleData.databaseAccessors}
        payloadAccessors={astRuleData.payloadAccessors}
        astOperators={astRuleData.astOperators}
        dataModel={astRuleData.dataModel}
        customLists={astRuleData.customLists}
        triggerObjectType={triggerObjectType}
      />
    </>
  );
}

function RuleFormula({
  formula,
  databaseAccessors,
  payloadAccessors,
  astOperators,
  dataModel,
  customLists,
  triggerObjectType,
}: {
  formula: AstNode;
  databaseAccessors: DatabaseAccessAstNode[];
  payloadAccessors: PayloadAstNode[];
  astOperators: AstOperator[];
  dataModel: TableModel[];
  customLists: CustomList[];
  triggerObjectType: string;
}) {
  const astEditor = useAstBuilder({
    backendAst: formula,
    localValidation: null,
    databaseAccessors,
    payloadAccessors,
    astOperators,
    dataModel,
    customLists,
    triggerObjectType,
    onValidate: () => {},
  });

  return (
    <Paper.Container scrollable={false} className="bg-grey-00">
      <AstBuilder builder={astEditor} viewOnly={true} />
    </Paper.Container>
  );
}
