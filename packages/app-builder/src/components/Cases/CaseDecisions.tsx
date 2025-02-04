import {
  type DataModelObject,
  type Pivot,
  type TableModel,
} from '@app-builder/models';
import {
  type DatabaseAccessAstNode,
  type PayloadAstNode,
} from '@app-builder/models/astNode/data-accessor';
import { type CustomList } from '@app-builder/models/custom-list';
import {
  type Decision,
  type RuleExecution,
} from '@app-builder/models/decision';
import { type LicenseEntitlements } from '@app-builder/models/license';
import { type RuleSnoozeWithRuleId } from '@app-builder/models/rule-snooze';
import { type ScenarioIterationRule } from '@app-builder/models/scenario-iteration-rule';
import { ReviewDecisionModal } from '@app-builder/routes/ressources+/cases+/review-decision';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import * as Ariakit from '@ariakit/react';
import { Await, Link, useFetcher } from '@remix-run/react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import {
  CollapsibleV2,
  MenuButton,
  MenuItem,
  MenuPopover,
  MenuRoot,
  ModalV2,
  Switch,
  Tooltip,
} from 'ui-design-system';
import { Icon } from 'ui-icons';

import { IngestedObjectDetail } from '../Data/IngestedObjectDetail';
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
import { CaseDetailTriggerObject } from '../Decisions/TriggerObjectDetail';
import { CasePivotValues } from './CasePivotValues';
import { casesI18n } from './cases-i18n';
import { RuleSnoozes } from './RuleSnoozes';

interface DecisionsDetailWithContext {
  decisionId: string;
  ruleExecutions: RuleExecution[];
  triggerObjectType: string;
  pivots: Pivot[];
  rules: ScenarioIterationRule[];
  accessors: {
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
  };
  ruleSnoozes: RuleSnoozeWithRuleId[];
}

export function CaseDecisions({
  decisions,
  featureAccess,
  entitlements,
  caseDecisionsPromise,
}: {
  decisions: Decision[];
  featureAccess: {
    isReadSnoozeAvailable: boolean;
    isCreateSnoozeAvailable: boolean;
  };
  entitlements: LicenseEntitlements;
  caseDecisionsPromise: Promise<
    [TableModel[], CustomList[], DecisionsDetailWithContext[]]
  >;
}) {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();

  return (
    <div className="grid grid-cols-[repeat(2,_max-content)_2fr_1fr_repeat(3,_max-content)] gap-x-6 gap-y-2">
      <div className="col-span-full grid grid-cols-subgrid px-4">
        <div className="text-grey-00 text-s col-start-2 font-semibold">
          {t('decisions:created_at')}
        </div>
        <div className="text-grey-00 text-s font-semibold">
          {t('decisions:scenario.name')}
        </div>
        <div className="text-grey-00 text-s font-semibold">
          {t('decisions:trigger_object.type')}
        </div>
        <div className="text-grey-00 text-s font-semibold">
          {t('decisions:score')}
        </div>
        <div className="text-grey-00 text-s font-semibold">
          {t('decisions:outcome')}
        </div>
      </div>
      {decisions.map((row) => {
        return (
          <CollapsibleV2.Provider
            key={row.id}
            defaultOpen={decisions.length === 1}
          >
            <div className="bg-grey-100 border-grey-90 col-span-full grid grid-cols-subgrid rounded-md border">
              <div className="col-span-full grid grid-cols-subgrid items-center px-4 py-3">
                <CollapsibleV2.Title className="border-grey-90 focus-visible:border-purple-65 group rounded border outline-none transition-colors">
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
                      className="hover:text-purple-60 focus:text-purple-60 text-purple-65 relative line-clamp-2 font-semibold hover:underline focus:underline"
                    >
                      {row.scenario.name}
                    </Link>
                  </Tooltip.Default>
                  <div className="border-grey-90 text-grey-00 rounded-full border px-3 py-1 font-semibold">
                    {`V${row.scenario.version}`}
                  </div>
                </div>
                <div>
                  <Tooltip.Default content={row.triggerObjectType}>
                    <span className="text-grey-00 text-s line-clamp-2 w-fit break-all font-normal">
                      {row.triggerObjectType}
                    </span>
                  </Tooltip.Default>
                </div>
                <Score score={row.score} />
                <OutcomeAndReviewStatusWithModal decision={row} />
                <DecisionActions decision={row} />
              </div>
              <CollapsibleV2.Content className="col-span-full">
                <React.Suspense fallback={<DecisionDetailSkeleton />}>
                  <Await resolve={caseDecisionsPromise}>
                    {([dataModel, customLists, decisionsDetail]) => {
                      return (
                        <DecisionDetail
                          key={row.id}
                          decision={row}
                          decisionsDetail={decisionsDetail}
                          dataModel={dataModel}
                          customLists={customLists}
                          entitlements={entitlements}
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
            className="hover:bg-orange-87 transition-colors"
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
            <button className="hover:bg-purple-98 active:bg-purple-96 rounded">
              <Icon icon="more-menu" className="size-6" />
              <span className="sr-only">{t('common:more_options')}</span>
            </button>
          }
        />
        <MenuPopover modal className="flex flex-col gap-2 p-2">
          <MenuItem
            className="data-[active-item]:bg-purple-98 group flex flex-row gap-2 rounded p-2 outline-none"
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
              className="data-[active-item]:bg-purple-98 group flex flex-row gap-2 rounded p-2 outline-none"
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
  entitlements,
  featureAccess,
}: {
  decision: Decision;
  decisionsDetail: DecisionsDetailWithContext[];
  dataModel: TableModel[];
  customLists: CustomList[];
  entitlements: LicenseEntitlements;
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
  const [objectLink, setObjectLink] = React.useState<{
    tableName: string;
    objectId: string;
  } | null>(null);

  const pivotValues = React.useMemo(() => {
    return R.pipe(
      decision.pivotValues,
      R.map(({ id, value }) => {
        if (!id || !value) return null;
        const pivot = decisionDetail?.pivots.find((p) => p.id === id);
        if (!pivot) return null;
        return {
          pivot,
          value,
        };
      }),
      R.filter(R.isNonNullish),
    );
  }, [decision.pivotValues, decisionDetail?.pivots]);

  const [showHitOnly, setShowHitOnly] = React.useState(true);
  const filteredRuleExecutions = React.useMemo(() => {
    if (!decisionDetail?.ruleExecutions) return [];
    if (showHitOnly) {
      return decisionDetail.ruleExecutions.filter(
        (ruleExecution) => ruleExecution.outcome === 'hit',
      );
    }
    return decisionDetail.ruleExecutions;
  }, [decisionDetail?.ruleExecutions, showHitOnly]);

  if (!decisionDetail) {
    return null;
  }

  return (
    <div className="flex flex-row gap-6 p-4">
      <div className="flex h-fit flex-[2] flex-col gap-2">
        <div className="flex flex-row items-center justify-between gap-2">
          <span className="text-grey-00 text-xs font-medium first-letter:capitalize">
            {t('cases:case_detail.rules_execution', {
              count: decisionDetail.ruleExecutions.length,
            })}
          </span>
          <ShowHitOnlySwitch
            checked={showHitOnly}
            onCheckedChange={setShowHitOnly}
          />
        </div>
        <RulesExecutionsContainer className="h-fit">
          {filteredRuleExecutions.map((ruleExecution) => {
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
                      payloadAccessors:
                        decisionDetail.accessors.payloadAccessors,
                      rules: decisionDetail.rules,
                    }}
                  />

                  {pivotValues.length > 0 ? (
                    <RuleSnoozes
                      ruleSnoozes={ruleSnoozes}
                      pivotValues={pivotValues}
                      entitlements={entitlements}
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

      <div className="sticky top-0 flex h-fit flex-1 flex-col gap-6">
        <div className="flex h-fit flex-col gap-2">
          <div className="col-start-2 row-start-1 flex flex-row items-center justify-between gap-2">
            <span className="text-grey-00 text-xs font-medium first-letter:capitalize">
              {t('cases:case_detail.pivot_values')}
            </span>
          </div>
          <CasePivotValues pivotValues={pivotValues} />
        </div>

        <div className="flex h-fit flex-col gap-2">
          <div className="flex flex-row items-center justify-between gap-2">
            <span className="text-grey-00 text-xs font-medium first-letter:capitalize">
              {t('cases:case_detail.trigger_object')}
            </span>
          </div>
          <CaseDetailTriggerObject
            className="h-fit max-h-[50dvh] overflow-auto"
            dataModel={dataModel}
            triggerObject={decision.triggerObject}
            triggerObjectType={decision.triggerObjectType}
            onLinkClicked={(tableName, objectId) =>
              setObjectLink({ tableName, objectId })
            }
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
    </div>
  );
}

function IngestedObjectDetailModal({
  dataModel,
  tableName,
  objectId,
  onClose,
}: {
  dataModel: TableModel[];
  tableName: string;
  objectId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation(['data']);
  const {
    load: fetcherLoad,
    data,
    state: fetchState,
  } = useFetcher<{ object: DataModelObject | null }>();

  React.useEffect(() => {
    fetcherLoad(
      getRoute('/data/view/:tableName/:objectId', {
        tableName,
        objectId,
      }),
    );
  }, [fetcherLoad, tableName, objectId]);

  if (fetchState === 'loading' || !data) {
    return null;
  }

  return (
    <ModalV2.Content open onClose={onClose} size="large">
      <ModalV2.Title>{tableName}</ModalV2.Title>
      {data.object ? (
        <IngestedObjectDetail
          light
          bordered={false}
          withLinks={false}
          dataModel={dataModel}
          tableName={tableName}
          objectId={objectId}
          object={data.object}
        />
      ) : (
        <div className="p-4 text-center">
          {t('data:viewer.no_object_found', { tableName, objectId })}
        </div>
      )}
    </ModalV2.Content>
  );
}

function ShowHitOnlySwitch({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  const { t } = useTranslation(casesI18n);
  const id = React.useId();

  return (
    <div className="flex flex-row items-center gap-2">
      <label
        htmlFor={id}
        className="text-grey-00 cursor-pointer select-none text-xs"
      >
        {t('cases:case_detail.rules_execution.show_hit_only')}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function DecisionDetailSkeleton() {
  return (
    <div className="flex flex-row gap-6 p-4">
      <div className="flex h-fit flex-[2] flex-col gap-2">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="bg-grey-90 h-4 w-32 animate-pulse rounded-md" />
          <div className="bg-grey-90 h-4 w-32 animate-pulse rounded-md" />
        </div>
        <div className="bg-grey-90 h-12 animate-pulse rounded-lg" />
        <div className="bg-grey-90 h-12 animate-pulse rounded-lg" />
        <div className="bg-grey-90 h-12 animate-pulse rounded-lg" />
      </div>

      <div className="flex h-fit flex-1 flex-col gap-6">
        <div className="flex h-fit flex-col gap-2">
          <div className="col-start-2 row-start-1 flex flex-row items-center justify-between gap-2">
            <div className="bg-grey-90 h-4 w-32 animate-pulse rounded-md" />
          </div>
          <div className="bg-grey-90 h-8 w-full animate-pulse rounded-md" />
        </div>

        <div className="flex h-fit flex-col gap-2">
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="bg-grey-90 h-4 w-32 animate-pulse rounded-md" />
          </div>
          <div className="bg-grey-90 h-60 w-full animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
}
