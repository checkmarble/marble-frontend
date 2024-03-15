import { Callout, decisionsI18n, Paper } from '@app-builder/components';
import { Score } from '@app-builder/components/Decisions/Score';
import {
  type AstNode,
  type AstOperator,
  type DatabaseAccessAstNode,
  type PayloadAstNode,
  type TableModel,
} from '@app-builder/models';
import { type RuleExecutionWithFormula } from '@app-builder/models/decision';
import { useAstBuilder } from '@app-builder/services/editor/ast-editor';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { type CustomList } from 'marble-api';
import { Trans, useTranslation } from 'react-i18next';
import { Accordion, Collapsible, Tag } from 'ui-design-system';

import { AstBuilder } from '../Scenario/AstBuilder';

export function RulesDetail({
  rules,
  triggerObjectType,
  databaseAccessors,
  payloadAccessors,
  astOperators,
  dataModel,
  customLists,
}: {
  rules: RuleExecutionWithFormula[];
  triggerObjectType: string;
  databaseAccessors: DatabaseAccessAstNode[];
  payloadAccessors: PayloadAstNode[];
  astOperators: AstOperator[];
  dataModel: TableModel[];
  customLists: CustomList[];
}) {
  const { t } = useTranslation(decisionsI18n);
  const language = useFormatLanguage();

  return (
    <Collapsible.Container className="bg-grey-00">
      <Collapsible.Title>{t('decisions:rules.title')}</Collapsible.Title>
      <Collapsible.Content>
        <Accordion.Container>
          {rules.map((rule, index) => {
            const isTriggered = rule.status === 'triggered';

            const title = (
              <div className="flex grow items-center justify-between">
                <div className="text-s flex items-center gap-2 font-semibold">
                  {rule.name}
                  {isTriggered ? <Score score={rule.scoreModifier} /> : null}
                </div>
                {rule.status ? (
                  <Tag
                    border="square"
                    size="big"
                    color={isTriggered ? 'green' : 'red'}
                    className="capitalize"
                  >
                    {t(`decisions:rules.status.${rule.status}`)}
                  </Tag>
                ) : null}
              </div>
            );

            return (
              <Accordion.Item
                key={`rule_${index}`}
                value={`rule_${index}`}
                className="border-grey-10 overflow-hidden rounded border"
              >
                <Accordion.Title className="flex flex-1 items-center justify-between gap-4 p-4">
                  {title}
                  <Accordion.Arrow />
                </Accordion.Title>
                <Accordion.Content className="bg-purple-02 border-grey-10 border-t">
                  <div className="flex flex-col gap-4 p-4">
                    {rule.description ? (
                      <Callout variant="outlined">{rule.description}</Callout>
                    ) : null}
                    <div className="bg-purple-10 inline-flex h-8 w-fit items-center justify-center whitespace-pre rounded px-2 font-normal text-purple-100">
                      <Trans
                        t={t}
                        i18nKey="scenarios:rules.consequence.score_modifier"
                        components={{
                          Score: <span className="font-semibold" />,
                        }}
                        values={{
                          score: formatNumber(rule.ruleDetail.scoreModifier, {
                            language,
                            signDisplay: 'always',
                          }),
                        }}
                      />
                    </div>
                    {rule.ruleDetail.formula ? (
                      <RuleFormula
                        formula={rule.ruleDetail.formula}
                        databaseAccessors={databaseAccessors}
                        payloadAccessors={payloadAccessors}
                        astOperators={astOperators}
                        dataModel={dataModel}
                        customLists={customLists}
                        triggerObjectType={triggerObjectType}
                      />
                    ) : null}
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
