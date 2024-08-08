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
import {
  type RuleSnooze,
  type RuleSnoozeWithRuleId,
} from '@app-builder/models/rule-snooze';
import { type ScenarioIterationRule } from '@app-builder/models/scenario-iteration-rule';
import { AddRuleSnooze } from '@app-builder/routes/ressources+/cases+/add-rule-snooze';
import { getPivotDisplayValue } from '@app-builder/services/data/pivot';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import { Await, Link } from '@remix-run/react';
import { type CustomList } from 'marble-api';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import {
  Button,
  CollapsibleV2,
  MenuButton,
  MenuItem,
  MenuPopover,
  MenuRoot,
  Tag,
} from 'ui-design-system';
import { Icon } from 'ui-icons';

import { Callout } from '../Callout';
import { PivotType } from '../Data/SelectedPivot';
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
  ruleSnoozes: RuleSnoozeWithRuleId[];
}

export function CaseDecisions({
  decisions,
  caseDecisionsPromise,
}: {
  decisions: Decision[];
  caseDecisionsPromise: Promise<
    [
      TableModel[],
      CustomList[],
      DecisionsDetail[],
      {
        isReadSnoozeAvailable: boolean;
        isCreateSnoozeAvailable: boolean;
      },
    ]
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
                <div className="bg-purple-02 border-t-grey-10 border-t">
                  <React.Suspense fallback={t('common:loading')}>
                    <Await resolve={caseDecisionsPromise}>
                      {([
                        dataModel,
                        customLists,
                        decisionsDetail,
                        featureAccess,
                      ]) => {
                        return (
                          <DecisionDetail
                            key={row.id}
                            decision={row}
                            decisionsDetail={decisionsDetail}
                            dataModel={dataModel}
                            customLists={customLists}
                            featureAccess={featureAccess}
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
  decision,
  decisionsDetail,
  dataModel,
  customLists,
  featureAccess,
}: {
  decision: Decision;
  decisionsDetail: DecisionsDetail[];
  dataModel: TableModel[];
  customLists: CustomList[];
  featureAccess: {
    isReadSnoozeAvailable: boolean;
    isCreateSnoozeAvailable: boolean;
  };
}) {
  const { t } = useTranslation(casesI18n);
  const getCopyToClipboardProps = useGetCopyToClipboard();
  const decisionDetail = React.useMemo(
    () => decisionsDetail.find((detail) => decision.id === detail.decisionId),
    [decision.id, decisionsDetail],
  );
  if (!decisionDetail) {
    return null;
  }

  const pivotValues = R.pipe(
    decision.pivotValues,
    R.map(({ id, value }) => {
      if (!id || !value) return null;
      const pivot = decisionDetail.pivots.find((p) => p.id === id);
      if (!pivot) return null;
      return {
        pivot,
        value,
      };
    }),
    R.filter(R.isNonNullish),
  );

  return (
    <div className="flex flex-col gap-6 p-4">
      {pivotValues.length > 0 ? (
        <div>
          <div className="text-grey-50 text-s mb-1 capitalize">
            {t('cases:case_detail.pivot_values')}
          </div>
          <div className="border-grey-10 overflow-hidden rounded border">
            <table className="bg-grey-00 w-full table-auto border-collapse">
              <thead>
                <tr className="bg-grey-02 min-h-8">
                  <th className="text-grey-50 px-4 py-2 text-left text-xs font-semibold">
                    {t('decisions:pivot_detail.type')}
                  </th>
                  <th className="text-grey-50 px-4 py-2 text-left text-xs font-semibold">
                    {t('decisions:pivot_detail.definition')}
                  </th>
                  <th className="text-grey-50 px-4 py-2 text-left text-xs font-semibold">
                    {t('decisions:pivot_detail.pivot_value')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pivotValues.map((pivotValue) => {
                  return (
                    <tr
                      key={pivotValue.pivot.id}
                      className="border-grey-10 border-t"
                    >
                      <td className="px-4 py-1">
                        <PivotType type={pivotValue.pivot.type} />
                      </td>
                      <td className="text-grey-100 text-s break-all px-4 py-2">
                        {getPivotDisplayValue(pivotValue.pivot)}
                      </td>
                      <td
                        className="px-4 py-2"
                        {...getCopyToClipboardProps(pivotValue.value)}
                      >
                        <div className="group flex h-full cursor-pointer flex-row items-center gap-2">
                          <span className="text-grey-50 group-hover:text-grey-100 select-none break-all text-xs font-normal transition-colors">
                            {pivotValue.value}
                          </span>
                          <Icon
                            icon="duplicate"
                            className="group-hover:text-grey-100 size-4 shrink-0 text-transparent transition-colors"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div>
        <div className="text-grey-50 text-s capitalize">
          {t('cases:case_detail.rules_execution')}
        </div>
        <div className="-mx-2 grid grid-cols-[max-content_1fr_max-content_max-content] gap-2">
          {decisionDetail.ruleExecutions.map((ruleExecution) => {
            const isHit = isRuleExecutionHit(ruleExecution);
            const ruleSnoozes = decisionDetail.ruleSnoozes.filter(
              (snooze) => snooze.ruleId === ruleExecution.ruleId,
            );

            return (
              <CollapsibleV2.Provider key={ruleExecution.ruleId}>
                <CollapsibleV2.Title className="group col-span-full grid grid-cols-subgrid items-center rounded border border-transparent px-2 outline-none transition-colors focus-visible:border-purple-100">
                  <Icon
                    icon="arrow-2-up"
                    aria-hidden
                    className="-mx-2 size-6 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180 group-data-[initial]:rotate-180"
                  />
                  <div className="text-s flex items-center gap-2 font-semibold">
                    {ruleExecution.name}
                  </div>
                  {isHit ? <Score score={ruleExecution.scoreModifier} /> : null}
                  <Tag
                    border="square"
                    size="big"
                    color={getRuleExecutionStatusColor(ruleExecution)}
                    className="col-start-4 min-w-14 capitalize"
                  >
                    {getRuleExecutionStatusLabel(t, ruleExecution)}
                  </Tag>
                </CollapsibleV2.Title>
                <CollapsibleV2.Content className="col-span-full">
                  <div className="flex flex-col gap-2 px-2">
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
                        payloadAccessors:
                          decisionDetail.accessors.payloadAccessors,
                        operators: decisionDetail.operators,
                        rules: decisionDetail.rules,
                      }}
                    />

                    {featureAccess.isReadSnoozeAvailable &&
                    pivotValues.length > 0 ? (
                      <RuleSnoozes
                        ruleSnoozes={ruleSnoozes}
                        pivotValues={pivotValues}
                        isCreateSnoozeAvailable={
                          featureAccess.isCreateSnoozeAvailable
                        }
                        decisionId={decision.id}
                        ruleId={ruleExecution.ruleId}
                      />
                    ) : null}
                  </div>
                </CollapsibleV2.Content>
              </CollapsibleV2.Provider>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RuleSnoozes({
  ruleSnoozes,
  pivotValues,
  isCreateSnoozeAvailable,
  decisionId,
  ruleId,
}: {
  ruleSnoozes: RuleSnooze[];
  pivotValues: {
    pivot: Pivot;
    value: string;
  }[];
  isCreateSnoozeAvailable: boolean;
  decisionId: string;
  ruleId: string;
}) {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const getCopyToClipboardProps = useGetCopyToClipboard();

  return (
    <div className="border-grey-10 overflow-hidden rounded border">
      <table className="bg-grey-00 w-full table-fixed border-collapse">
        <thead>
          <tr className="bg-grey-02 min-h-8">
            <th className="text-grey-50 px-4 py-2 text-left text-xs font-semibold">
              {t('decisions:pivot_value')}
            </th>
            <th className="text-grey-50 px-4 py-2 text-left text-xs font-semibold">
              {t('cases:case_detail.add_rule_snooze')}
            </th>
          </tr>
        </thead>
        <tbody>
          {pivotValues.map(({ pivot, value }) => {
            const snooze = ruleSnoozes.find(
              (snooze) => snooze.pivotValue === value,
            );
            return (
              <tr key={pivot.id} className="border-grey-10 border-t">
                <td className="px-4 py-2" {...getCopyToClipboardProps(value)}>
                  <div className="group flex h-full cursor-pointer flex-row items-center gap-2">
                    <span className="text-grey-50 group-hover:text-grey-100 select-none break-all text-xs font-normal transition-colors">
                      {value}
                    </span>
                    <Icon
                      icon="duplicate"
                      className="group-hover:text-grey-100 size-4 shrink-0 text-transparent transition-colors"
                    />
                  </div>
                </td>
                {snooze ? (
                  <td className="px-4 py-2">
                    <div className="grid w-fit grid-cols-[1fr_max-content_1fr] gap-1">
                      <span className="text-grey-100 text-s text-right">
                        {formatDateTime(snooze.startsAt, { language })}
                      </span>
                      <span className="text-s self-center">→</span>
                      <span className="text-grey-100 text-s">
                        {formatDateTime(snooze.endsAt, { language })}
                      </span>
                    </div>
                  </td>
                ) : isCreateSnoozeAvailable ? (
                  <td className="px-4 py-1">
                    <AddRuleSnooze decisionId={decisionId} ruleId={ruleId}>
                      <Button className="h-8 w-fit">
                        <Icon icon="plus" className="size-5" />
                        {t('cases:case_detail.add_rule_snooze')}
                      </Button>
                    </AddRuleSnooze>
                  </td>
                ) : (
                  <td className="text-s px-4 py-2">
                    {t('cases:case_detail.add_rule_snooze.no_access')}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
