import {
  type DatabaseAccessAstNode,
  type PayloadAstNode,
  type Pivot,
  type TableModel,
} from '@app-builder/models';
import { type CustomList } from '@app-builder/models/custom-list';
import {
  type Decision,
  type DecisionDetail,
  type RuleExecution,
} from '@app-builder/models/decision';
import { type OperatorFunction } from '@app-builder/models/editable-operators';
import { type RuleSnoozeWithRuleId } from '@app-builder/models/rule-snooze';
import { type ScenarioIterationRule } from '@app-builder/models/scenario-iteration-rule';
import { ReviewDecisionModal } from '@app-builder/routes/ressources+/cases+/review-decision';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import * as Ariakit from '@ariakit/react';
import { Await, Link } from '@remix-run/react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import {
  CollapsibleV2,
  MenuButton,
  MenuItem,
  MenuPopover,
  MenuRoot,
  Tooltip,
} from 'ui-design-system';
import { Icon } from 'ui-icons';

import { RuleExecutionDetail } from '../Decisions';
import { OutcomeAndReviewStatus } from '../Decisions/OutcomeAndReviewStatus';
import {
  RuleExecutionCollapsible,
  RuleExecutionContent,
  RuleExecutionDescription,
  RuleExecutionTitle,
  RulesExecutionsContainer,
} from '../Decisions/RulesExecutions/RulesExecutions';
import { Score } from '../Decisions/Score';
import { casesI18n } from './cases-i18n';
import { RuleSnoozes } from './RuleSnoozes';

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
    <div className="grid grid-cols-[repeat(2,_max-content)_1fr_repeat(4,_max-content)] gap-x-6 gap-y-2">
      <div className="col-span-full grid grid-cols-subgrid px-4">
        <div className="text-grey-100 text-s col-start-2 font-semibold">
          {t('decisions:created_at')}
        </div>
        <div className="text-grey-100 text-s font-semibold">
          {t('decisions:scenario.name')}
        </div>
        <div className="text-grey-100 text-s font-semibold">
          {t('decisions:trigger_object.type')}
        </div>
        <div className="text-grey-100 text-s font-semibold">
          {t('decisions:score')}
        </div>
        <div className="text-grey-100 text-s font-semibold">
          {t('decisions:outcome')}
        </div>
      </div>
      {decisions.map((row) => {
        return (
          <CollapsibleV2.Provider key={row.id}>
            <div className="bg-grey-00 border-grey-10 col-span-full grid grid-cols-subgrid overflow-hidden rounded-md border">
              <div className="col-span-full grid grid-cols-subgrid items-center px-4 py-3">
                <CollapsibleV2.Title className="border-grey-10 group rounded border outline-none transition-colors focus-visible:border-purple-100">
                  <Icon
                    icon="smallarrow-up"
                    aria-hidden
                    className="size-5 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180 group-data-[initial]:rotate-180 rtl:-rotate-90 rtl:group-aria-expanded:-rotate-180 rtl:group-data-[initial]:-rotate-180"
                  />
                </CollapsibleV2.Title>
                <time dateTime={row.createdAt}>
                  {formatDateTime(row.createdAt, {
                    language,
                    timeStyle: undefined,
                  })}
                </time>
                <div className="flex flex-row items-center gap-2">
                  <Tooltip.Default content={row.scenario.name}>
                    <Link
                      to={getRoute('/scenarios/:scenarioId', {
                        scenarioId: fromUUID(row.scenario.id),
                      })}
                      className="hover:text-purple-120 focus:text-purple-120 relative line-clamp-2 font-semibold text-purple-100 hover:underline focus:underline"
                    >
                      {row.scenario.name}
                    </Link>
                  </Tooltip.Default>
                  <div className="border-grey-10 text-grey-100 rounded-full border px-3 py-1 font-semibold">
                    {`V${row.scenario.version}`}
                  </div>
                </div>
                <div>{row.triggerObjectType}</div>
                <Score score={row.score} />
                <OutcomeAndReviewStatusWithModal decision={row} />
                <DecisionActions decision={row} />
              </div>
              <CollapsibleV2.Content className="col-span-full">
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
              </CollapsibleV2.Content>
            </div>
          </CollapsibleV2.Provider>
        );
      })}
    </div>
  );
}

function isPendingBlockAndReview(decision: Decision) {
  return (
    decision.reviewStatus === 'pending' &&
    decision.outcome === 'block_and_review'
  );
}

function OutcomeAndReviewStatusWithModal({ decision }: { decision: Decision }) {
  const reviewDecisionModalStore = Ariakit.useDialogStore();
  const withReviewDecisionModal = isPendingBlockAndReview(decision);

  if (withReviewDecisionModal) {
    return (
      <>
        <Ariakit.DialogDisclosure store={reviewDecisionModalStore}>
          <OutcomeAndReviewStatus
            outcome={decision.outcome}
            reviewStatus={decision.reviewStatus}
            className="hover:bg-orange-25 transition-colors"
          />
        </Ariakit.DialogDisclosure>
        <ReviewDecisionModal
          decisionId={decision.id}
          store={reviewDecisionModalStore}
        />
      </>
    );
  }
  return (
    <OutcomeAndReviewStatus
      outcome={decision.outcome}
      reviewStatus={decision.reviewStatus}
    />
  );
}

function DecisionActions({ decision }: { decision: Decision }) {
  const { t, i18n } = useTranslation(casesI18n);

  const reviewDecisionModalStore = Ariakit.useDialogStore();

  const withReviewDecisionModal = isPendingBlockAndReview(decision);

  return (
    <>
      <MenuRoot rtl={i18n.dir() === 'rtl'}>
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
          {withReviewDecisionModal ? (
            <MenuItem
              className="data-[active-item]:bg-purple-05 group flex flex-row gap-2 rounded p-2 outline-none"
              render={
                <Ariakit.DialogDisclosure store={reviewDecisionModalStore} />
              }
            >
              {t('cases:case_detail.review_decision.title')}
            </MenuItem>
          ) : null}
        </MenuPopover>
      </MenuRoot>
      {withReviewDecisionModal ? (
        <ReviewDecisionModal
          decisionId={decision.id}
          store={reviewDecisionModalStore}
        />
      ) : null}
    </>
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
    <div className="flex flex-col gap-2 p-4">
      <div className="text-grey-100 text-xs font-medium first-letter:capitalize">
        {t('cases:case_detail.rules_execution', {
          count: decisionDetail.ruleExecutions.length,
        })}
      </div>
      <RulesExecutionsContainer>
        {decisionDetail.ruleExecutions.map((ruleExecution) => {
          const ruleSnoozes = decisionDetail.ruleSnoozes.filter(
            (snooze) => snooze.ruleId === ruleExecution.ruleId,
          );

          return (
            <RuleExecutionCollapsible key={ruleExecution.ruleId}>
              <RuleExecutionTitle ruleExecution={ruleExecution} />
              <RuleExecutionContent>
                <RuleExecutionDescription
                  description={ruleExecution.description}
                />

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
              </RuleExecutionContent>
            </RuleExecutionCollapsible>
          );
        })}
      </RulesExecutionsContainer>
    </div>
  );
}
