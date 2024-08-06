import {
  type DatabaseAccessAstNode,
  type PayloadAstNode,
  type Pivot,
  type TableModel,
} from '@app-builder/models';
import {
  type Decision,
  type DecisionDetail,
  isRuleExecutionHit,
  type RuleExecution,
} from '@app-builder/models/decision';
import { type OperatorFunction } from '@app-builder/models/editable-operators';
import { type ScenarioIterationRule } from '@app-builder/models/scenario-iteration-rule';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { Await, Link } from '@remix-run/react';
import { type CustomList } from 'marble-api';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CollapsibleV2,
  MenuButton,
  MenuItem,
  MenuPopover,
  MenuRoot,
  Tag,
} from 'ui-design-system';
import { Icon } from 'ui-icons';

import { Callout } from '../Callout';
import {
  getRuleExecutionStatusColor,
  getRuleExecutionStatusLabel,
  Outcome,
  RuleExecutionDetail,
} from '../Decisions';
import { Score } from '../Decisions/Score';
import { casesI18n } from './cases-i18n';

interface DecisionsDetail {
  decisionId: string;
  ruleExecutions: RuleExecution[];
  triggerObjectType: string;
  pivots: Pivot[];
  rules: ScenarioIterationRule[];
  accessors: {
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
  };
  operators: OperatorFunction[];
}

export function CaseDecisions({
  decisions,
  caseDecisionsPromise,
}: {
  decisions: Decision[];
  caseDecisionsPromise: Promise<
    [TableModel[], CustomList[], DecisionsDetail[]]
  >;
}) {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();

  return (
    <div className="grid grid-cols-[repeat(2,_max-content)_1fr_repeat(5,_max-content)] gap-x-6 gap-y-2">
      <div className="col-span-full grid grid-cols-subgrid px-4">
        <div className="text-grey-50 text-s col-start-2 font-semibold">
          {t('decisions:created_at')}
        </div>
        <div className="text-grey-50 text-s font-semibold">
          {t('decisions:scenario.name')}
        </div>
        <div className="text-grey-50 text-s font-semibold">Vi</div>
        <div className="text-grey-50 text-s font-semibold">
          {t('decisions:trigger_object.type')}
        </div>
        <div className="text-grey-50 text-s font-semibold">
          {t('decisions:score')}
        </div>
        <div className="text-grey-50 text-s font-semibold">
          {t('decisions:outcome')}
        </div>
      </div>
      {decisions.map((row) => {
        return (
          <CollapsibleV2.Provider key={row.id}>
            <div className="bg-grey-00 border-grey-10 col-span-full grid grid-cols-subgrid overflow-hidden rounded-md border">
              <div className="col-span-full grid grid-cols-subgrid items-center p-4">
                <CollapsibleV2.Title className="border-grey-10 group rounded border outline-none transition-colors focus-visible:border-purple-100">
                  <Icon
                    icon="smallarrow-up"
                    aria-hidden
                    className="size-6 transition-transform duration-200 group-aria-expanded:rotate-180"
                  />
                </CollapsibleV2.Title>
                <time dateTime={row.createdAt}>
                  {formatDateTime(row.createdAt, {
                    language,
                    timeStyle: undefined,
                  })}
                </time>
                <div className="text-left">
                  <Link
                    to={getRoute('/scenarios/:scenarioId', {
                      scenarioId: fromUUID(row.scenario.id),
                    })}
                    className="hover:text-purple-120 focus:text-purple-120 relative font-semibold text-purple-100 hover:underline focus:underline"
                  >
                    {row.scenario.name}
                  </Link>
                </div>
                <Link
                  to={getRoute('/scenarios/:scenarioId/i/:iterationId', {
                    scenarioId: fromUUID(row.scenario.id),
                    iterationId: fromUUID(row.scenario.scenarioIterationId),
                  })}
                  className="hover:text-purple-120 focus:text-purple-120 relative font-semibold text-purple-100 hover:underline focus:underline"
                >
                  {`V${row.scenario.version}`}
                </Link>
                <div>{row.triggerObjectType}</div>
                <Score score={row.score} />
                <Outcome border="square" size="big" outcome={row.outcome} />
                <DecisionActions decision={row} />
              </div>
              <CollapsibleV2.Content className="col-span-full">
                <div className="bg-purple-02 border-t-grey-10 border-t py-4">
                  <React.Suspense fallback={t('common:loading')}>
                    <Await resolve={caseDecisionsPromise}>
                      {([dataModel, customLists, decisionsDetail]) => {
                        return (
                          <DecisionDetail
                            key={row.id}
                            decisionId={row.id}
                            decisionsDetail={decisionsDetail}
                            dataModel={dataModel}
                            customLists={customLists}
                          />
                        );
                      }}
                    </Await>
                  </React.Suspense>
                </div>
              </CollapsibleV2.Content>
            </div>
          </CollapsibleV2.Provider>
        );
      })}
    </div>
  );
}

function DecisionActions({ decision }: { decision: Decision }) {
  const { t } = useTranslation(casesI18n);
  return (
    <MenuRoot>
      <MenuButton
        render={
          <button className="hover:bg-purple-05 active:bg-purple-10 rounded">
            <Icon icon="more-menu" className="size-6" />
            <span className="sr-only">{t('common:more_options')}</span>
          </button>
        }
      />
      <MenuPopover modal className="flex flex-col gap-2 p-2">
        <MenuItem
          className="data-[active-item]:bg-purple-05 group flex flex-row gap-2 rounded p-2 outline-none"
          render={
            <Link
              to={getRoute('/decisions/:decisionId', {
                decisionId: fromUUID(decision.id),
              })}
            />
          }
        >
          {t('cases:case.decision_detail')}
        </MenuItem>
      </MenuPopover>
    </MenuRoot>
  );
}

function DecisionDetail({
  decisionId,
  decisionsDetail,
  dataModel,
  customLists,
}: {
  decisionId: string;
  decisionsDetail: DecisionsDetail[];
  dataModel: TableModel[];
  customLists: CustomList[];
}) {
  const { t } = useTranslation(casesI18n);
  const decisionDetail = React.useMemo(
    () => decisionsDetail.find((detail) => decisionId === detail.decisionId),
    [decisionId, decisionsDetail],
  );
  if (!decisionDetail) {
    return null;
  }

  return (
    <div className="grid grid-cols-[max-content_1fr_max-content_max-content] gap-x-2 gap-y-4">
      {decisionDetail.ruleExecutions.map((ruleExecution) => {
        const isHit = isRuleExecutionHit(ruleExecution);

        return (
          <CollapsibleV2.Provider key={ruleExecution.ruleId}>
            <CollapsibleV2.Title className="group col-span-full grid grid-cols-subgrid items-center rounded border border-transparent pl-2 pr-4 outline-none transition-colors focus-visible:border-purple-100">
              <Icon
                icon="arrow-2-up"
                aria-hidden
                className="size-6 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180 group-data-[initial]:rotate-180"
              />
              <div className="text-s flex items-center gap-2 font-semibold">
                {ruleExecution.name}
              </div>
              {isHit ? <Score score={ruleExecution.scoreModifier} /> : null}
              <Tag
                border="square"
                size="big"
                color={getRuleExecutionStatusColor(ruleExecution)}
                className="col-start-4 capitalize"
              >
                {getRuleExecutionStatusLabel(t, ruleExecution)}
              </Tag>
            </CollapsibleV2.Title>
            <CollapsibleV2.Content className="col-span-full">
              <div className="flex flex-col gap-4 px-4">
                {ruleExecution.description ? (
                  <Callout variant="outlined">
                    {ruleExecution.description}
                  </Callout>
                ) : null}

                <RuleExecutionDetail
                  key={ruleExecution.ruleId}
                  ruleExecution={ruleExecution}
                  triggerObjectType={decisionDetail.triggerObjectType}
                  astRuleData={{
                    dataModel,
                    customLists,
                    databaseAccessors:
                      decisionDetail.accessors.databaseAccessors,
                    payloadAccessors: decisionDetail.accessors.payloadAccessors,
                    operators: decisionDetail.operators,
                    rules: decisionDetail.rules,
                  }}
                />
              </div>
            </CollapsibleV2.Content>
          </CollapsibleV2.Provider>
        );
      })}
    </div>
  );
}
