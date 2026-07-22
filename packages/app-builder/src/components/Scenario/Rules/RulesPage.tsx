import { AstBuilder } from '@app-builder/components/AstBuilder';
import { OutcomeBadge } from '@app-builder/components/Decisions/OutcomeTag';
import { FiltersButton } from '@app-builder/components/Filters';
import { findDatasetByName, useDatasetTitle } from '@app-builder/components/ListAndTopicConfiguration/dataset-utils';
import { Panel } from '@app-builder/components/Panel';
import { CreateScreeningButton } from '@app-builder/components/Screenings/CreateScreeningButton';
import { useDatasetTag } from '@app-builder/components/Screenings/DatasetTag';
import { AstNode, isUndefinedAstNode, ScenarioValidation } from '@app-builder/models';
import { isDataAccessorAstNode } from '@app-builder/models/astNode/data-accessor';
import { isStringConcatAstNode, StringConcatAstNode } from '@app-builder/models/astNode/strings';
import { Scenario } from '@app-builder/models/scenario';
import { ScenarioIterationRuleMetadata } from '@app-builder/models/scenario/iteration-rule';
import { ScreeningCategory } from '@app-builder/models/screening';
import { ScreeningConfig } from '@app-builder/models/screening-config';
import { useScenarioIterationRule } from '@app-builder/queries/scenarios/scenario-iteration-rule';
import { useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import { getDataAccessorDisplayName } from '@app-builder/services/ast-node/getAstNodeDisplayName';
import type { EditorMode } from '@app-builder/services/editor/editor-mode';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { KeyboardEventHandler, type MouseEvent, MouseEventHandler, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import type { UUID } from 'short-uuid/src/types';
import { match } from 'ts-pattern';
import { CtaV2ClassName, cn, Popover, SearchInput, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CreateRule } from './Actions/CreateRule';
import { RuleEditPanel } from './RuleEditPanel';
import { ScreeningRuleEditPanel } from './ScreeningRuleEditPanel';

type RuleOrScreening = (ScenarioIterationRuleMetadata & { type: 'rule' }) | (ScreeningConfig & { type: 'sanction' });

type RulesPageProps = {
  scenario: Scenario;
  iterationId: UUID;
  screeningConfigs: ScreeningConfig[];
  scenarioValidation: ScenarioValidation;
  editorMode: NonNullable<EditorMode>;
  list: RuleOrScreening[];
  ruleGroups: string[];
  isSanctionAvailable: FeatureAccessLevelDto;
  isAiRuleDescriptionEnabled: boolean;
  isNameRecognitionAvailable: boolean;
  onRuleEditSuccess: () => Promise<void>;
};

const getRowLink = (currentTarget: EventTarget | null) => {
  if (!(currentTarget instanceof HTMLElement)) return null;
  const rowLink = currentTarget.querySelector('[data-row-button]');
  return rowLink instanceof HTMLButtonElement ? rowLink : null;
};

const handleRowClick: MouseEventHandler = (e) => {
  const rowLink = getRowLink(e.currentTarget);
  if (rowLink && rowLink !== e.target) {
    rowLink.dispatchEvent(new MouseEvent(e.type, e.nativeEvent));
  }
};

const handleRowKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;

  e.preventDefault();
  getRowLink(e.currentTarget)?.click();
};

export function RulesPage({
  scenario,
  iterationId,
  screeningConfigs,
  scenarioValidation,
  editorMode,
  list,
  ruleGroups,
  isSanctionAvailable,
  isAiRuleDescriptionEnabled,
  isNameRecognitionAvailable,
  onRuleEditSuccess,
}: RulesPageProps) {
  const { t } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();
  const [searchValue, setSearchValue] = useState('');
  const [currentEditing, setCurrentEditing] = useState<{ id: string; type: 'rule' | 'sanction' } | null>(null);
  const { org } = useOrganizationDetails();

  const currentScreeningRule =
    currentEditing?.type === 'sanction' ? screeningConfigs.find((sc) => sc.id === currentEditing.id) : null;

  const onPanelOpenChange = (state: boolean) => {
    if (!state) {
      setCurrentEditing(null);
    }
  };
  const handleRuleEditSuccess = async (ruleId?: string) => {
    await onRuleEditSuccess();
    if (ruleId) {
      setCurrentEditing({ id: ruleId, type: 'rule' });
    }
  };
  const handleScreeningRuleEditSuccess = async (ruleId?: string) => {
    await onRuleEditSuccess();
    if (ruleId) {
      setCurrentEditing({ id: ruleId, type: 'sanction' });
    }
  };
  const handleRuleDelete = async () => {
    setCurrentEditing(null);
    await onRuleEditSuccess();
  };

  return (
    <div className="flex flex-col gap-md">
      <div className="flex justify-between gap-sm">
        <SearchInput size="medium" value={searchValue} onChange={setSearchValue} className="w-100" />
        <div className="flex gap-sm">
          <FiltersButton />
          {editorMode === 'edit' ? (
            <AddRuleOrScreening
              scenarioId={scenario.id}
              iterationId={iterationId}
              isSanctionAvailable={isSanctionAvailable}
              onSuccess={async (value) => {
                await onRuleEditSuccess();
                setCurrentEditing(value);
              }}
            />
          ) : null}
        </div>
      </div>
      <div>
        <div className="grid grid-cols-[0px_auto_2fr_12.5rem_12.5rem] border border-grey-border rounded-md bg-surface-card">
          <div className="grid grid-cols-subgrid col-span-full items-center group/table-row not-last:border-b border-grey-border">
            <HeaderCell className="col-span-2">{t('scenarios:rules.title')}</HeaderCell>
            <HeaderCell>{t('scenarios:rules.description')}</HeaderCell>
            <HeaderCell>{t('scenarios:rules.rule_group')}</HeaderCell>
            <HeaderCell>{t('scenarios:rules.score_or_outcome')}</HeaderCell>
          </div>
          {list.map((rule) => {
            return (
              <Collapsible.Root
                key={`${rule.type}_${rule.id}`}
                className="overflow-hidden grid grid-cols-subgrid col-span-full group/table-row hover:bg-purple-background-light cursor-pointer "
                onClick={handleRowClick}
                onKeyDown={handleRowKeyDown}
                data-row
              >
                <Collapsible.Trigger asChild>
                  <div
                    role="link"
                    tabIndex={0}
                    className="grid grid-cols-subgrid col-span-full items-center focus-visible:outline-2 -outline-offset-2 outline-purple-primary"
                  >
                    <div className="invisible">
                      {editorMode === 'edit' ? (
                        <button
                          data-row-button
                          aria-label={t('scenarios:rules.edit_rule_aria_label')}
                          onClick={() => {
                            if (rule.id) {
                              setCurrentEditing({ id: rule.id, type: rule.type });
                            }
                          }}
                        />
                      ) : null}
                    </div>
                    <GridCell
                      className={cn({ 'grid grid-cols-[1rem_1fr] items-center gap-x-sm': editorMode === 'view' })}
                    >
                      {editorMode === 'view' ? (
                        <button type="button">
                          <Icon icon="caret-down" className="size-4" />
                        </button>
                      ) : null}
                      <span>{rule.name}</span>
                    </GridCell>
                    <GridCell>{rule.description}</GridCell>
                    <GridCell>{rule.ruleGroup ? <Tag>{rule.ruleGroup}</Tag> : null}</GridCell>
                    <GridCell>
                      {rule.type === 'rule' ? (
                        <span className={rule.scoreModifier < 0 ? 'text-green-primary' : 'text-red-primary'}>
                          {formatNumber(rule.scoreModifier, {
                            language,
                            signDisplay: 'exceptZero',
                          })}
                        </span>
                      ) : rule.forcedOutcome ? (
                        <OutcomeBadge outcome={rule.forcedOutcome} size="md" />
                      ) : null}
                    </GridCell>
                  </div>
                </Collapsible.Trigger>
                {rule.type === 'rule' ? (
                  <Collapsible.Content asChild>
                    <div className="col-span-full p-md grid grid-cols-[1rem_1fr] items-center gap-x-sm radix-state-open:animate-slide-down radix-state-closed:animate-slide-up">
                      <div className="border border-grey-border rounded-md px-md py-sm bg-surface-card max-w-3/4 col-start-2">
                        <RuleView scenarioId={scenario.id} ruleId={rule.id} />
                      </div>
                    </div>
                  </Collapsible.Content>
                ) : (
                  <Collapsible.Content asChild>
                    <div className="col-span-full p-md grid grid-cols-[1rem_1fr] items-center gap-x-sm radix-state-open:animate-slide-down radix-state-closed:animate-slide-up">
                      <div className="border border-grey-border rounded-md px-md py-sm bg-surface-card max-w-3/4 col-start-2 flex flex-col gap-sm">
                        <div>
                          <Trans
                            t={t}
                            i18nKey="scenarios:rules.screening_view.trigger_intro"
                            values={{ triggerObject: scenario.triggerObjectType }}
                            components={{ Tag: <Tag color="grey" /> }}
                          />
                        </div>
                        <ul className="list-disc flex flex-col gap-sm pl-5">
                          {rule.triggerRule && !isUndefinedAstNode(rule.triggerRule) ? (
                            <li className="list-item">
                              <div className="flex-col gap-sm">
                                <span>{t('scenarios:rules.screening_view.trigger_condition')}</span>
                                <AstBuilder.Provider scenarioId={scenario.id} mode="view">
                                  <AstBuilder.Root node={rule.triggerRule} />
                                </AstBuilder.Provider>
                              </div>
                            </li>
                          ) : null}
                          {rule.counterPartyId && isDataAccessorAstNode(rule.counterPartyId) ? (
                            <li className="list-item">
                              {t('scenarios:rules.screening_view.counterparty_id')}{' '}
                              <Tag color="grey">{getDataAccessorDisplayName(rule.counterPartyId)}</Tag>
                            </li>
                          ) : null}
                          {rule.entityType && rule.query ? (
                            <ScreeningRuleQueryView entityType={rule.entityType} query={rule.query} />
                          ) : null}
                          {rule.datasets && rule.datasets.length > 0 ? (
                            <ScreeningDatasetsView datasets={rule.datasets} />
                          ) : null}
                        </ul>
                        {rule.forcedOutcome ? (
                          <div>
                            <Trans
                              t={t}
                              i18nKey="scenarios:rules.screening_view.match_outcome"
                              values={{ threshold: rule.threshold ?? org.sanctionThreshold }}
                              components={{
                                Tag: <Tag color="grey" />,
                                Outcome: <OutcomeBadge outcome={rule.forcedOutcome} className="align-middle" />,
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </Collapsible.Content>
                )}
              </Collapsible.Root>
            );
          })}
        </div>
      </div>
      {editorMode === 'edit' ? (
        <>
          <Panel.Root open={currentEditing?.type === 'rule'} onOpenChange={onPanelOpenChange}>
            <Panel.Container size={isAiRuleDescriptionEnabled ? 'large' : 'medium'}>
              {currentEditing?.type === 'rule' ? (
                <RuleEditPanel
                  scenario={scenario}
                  ruleId={currentEditing.id}
                  ruleGroups={ruleGroups}
                  scenarioValidation={scenarioValidation}
                  isAiRuleDescriptionEnabled={isAiRuleDescriptionEnabled}
                  onSuccess={handleRuleEditSuccess}
                  onDelete={handleRuleDelete}
                />
              ) : null}
            </Panel.Container>
          </Panel.Root>
          <Panel.Root open={currentEditing?.type === 'sanction'} onOpenChange={onPanelOpenChange}>
            <Panel.Container size="medium">
              {currentScreeningRule ? (
                <ScreeningRuleEditPanel
                  rule={currentScreeningRule}
                  scenario={scenario}
                  iterationId={iterationId}
                  configs={screeningConfigs}
                  ruleGroups={ruleGroups}
                  scenarioValidation={scenarioValidation}
                  isNameRecognitionAvailable={isNameRecognitionAvailable}
                  onSuccess={handleScreeningRuleEditSuccess}
                  onDelete={handleRuleDelete}
                />
              ) : null}
            </Panel.Container>
          </Panel.Root>
        </>
      ) : null}
    </div>
  );
}

function GridCell({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={cn('p-md', className)}>{children}</div>;
}

function HeaderCell({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <GridCell className={cn('font-normal text-left not-first:border-l border-grey-border', className)}>
      {children}
    </GridCell>
  );
}

const RuleView = ({ scenarioId, ruleId }: { scenarioId: string; ruleId: string }) => {
  const { t } = useTranslation(['common']);
  const ruleQuery = useScenarioIterationRule(ruleId);

  return match(ruleQuery)
    .with({ isError: true }, ({ error }) => <>{error.message}</>)
    .with({ isPending: true }, () => <>{t('common:loading')}</>)
    .with({ isSuccess: true }, ({ data }) => {
      if (!data.rule.formula) {
        return null;
      }

      return (
        <AstBuilder.Provider scenarioId={scenarioId} mode="view">
          <AstBuilder.Root node={data.rule.formula} />
        </AstBuilder.Provider>
      );
    })
    .exhaustive();
};

const AddRuleOrScreening = ({
  scenarioId,
  iterationId,
  isSanctionAvailable,
  onSuccess,
}: {
  scenarioId: string;
  iterationId: string;
  isSanctionAvailable: FeatureAccessLevelDto;
  onSuccess: (value: { id: string; type: 'rule' | 'sanction' }) => void;
}) => {
  const { t } = useTranslation(['common', 'scenarios', 'decisions', 'filters']);
  const [open, setOpen] = useState(false);

  const handleSuccess = (value: { id: string; type: 'rule' | 'sanction' }) => {
    setOpen(false);
    onSuccess(value);
  };

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger className={CtaV2ClassName({ variant: 'primary', color: 'primary', size: 'medium' })}>
        <Icon icon="plus" className="size-6" />
        {t('common:add')}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="end"
        className="bg-surface-card border-grey-border z-10 mt-sm flex flex-col gap-sm rounded-sm border p-sm"
      >
        <CreateRule
          scenarioId={scenarioId}
          iterationId={iterationId}
          onSuccess={(ruleId) => handleSuccess({ id: ruleId, type: 'rule' })}
        />
        <CreateScreeningButton
          scenarioId={scenarioId}
          iterationId={iterationId}
          isSanctionAvailable={isSanctionAvailable}
          onSuccess={(screeningId) => handleSuccess({ id: screeningId, type: 'sanction' })}
        />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

type ScreeningRuleQueryViewProps = {
  entityType: string;
  query: Partial<Record<string, AstNode>>;
};

const filterNodes = (value: [string, AstNode | undefined]): value is [string, StringConcatAstNode] => {
  return !!value[1] && isStringConcatAstNode(value[1]);
};

const ScreeningRuleQueryView = ({ entityType, query }: ScreeningRuleQueryViewProps) => {
  const { t } = useTranslation(['common', 'scenarios']);
  const queries = R.pipe(
    R.entries(query),
    R.filter(filterNodes),
    // Show the "name" filter first when present
    R.sortBy(([k]) => (k === 'name' ? 0 : 1)),
  );

  return (
    <li className="list-item">
      <div className="grid grid-cols-[auto_1fr] gap-sm">
        <span>
          <Trans
            t={t}
            i18nKey="scenarios:rules.screening_view.we_look_for"
            values={{ entityType }}
            components={{ Tag: <Tag color="grey" /> }}
          />
        </span>
        <div className="flex flex-col gap-sm">
          {queries.map(([k, q]) => (
            <span key={q.id}>
              {'- '}
              <Tag color="grey">{k}</Tag> {t('scenarios:rules.screening_view.matching')}{' '}
              <span className="inline-flex gap-xs">
                {q.children.map((node) => (
                  <DataAccessorAstNodeTag key={node.id} node={node} />
                ))}
              </span>
            </span>
          ))}
        </div>
      </div>
    </li>
  );
};

const DataAccessorAstNodeTag = ({ node }: { node: AstNode }) => {
  if (!isDataAccessorAstNode(node)) return null;

  return <Tag color="grey">{getDataAccessorDisplayName(node)}</Tag>;
};

const MAX_VISIBLE_DATASETS = 4;

const stopPropagation = (e: MouseEvent) => {
  e.stopPropagation();
};

const ScreeningDatasetsView = ({ datasets }: { datasets: string[] }) => {
  const { t } = useTranslation(['scenarios']);
  const filtersQuery = useListConfigQuery('transaction_monitoring');
  const { formatItemName, formatDatasetTitle } = useDatasetTitle();
  const { getLaTagLabel } = useDatasetTag();

  const resolveName = (key: string) => {
    // Bare category entries (e.g. `sanctions`) have no `:` separator.
    if (!key.includes(':')) return getLaTagLabel(key as ScreeningCategory);
    const parts = key.split(':');
    if (parts[1] === 'dataset') {
      const resolved = findDatasetByName(filtersQuery.data?.filters, parts.slice(2).join(':'));
      if (resolved) return formatItemName(resolved);
    }
    return formatDatasetTitle(key);
  };

  const visible = datasets.slice(0, MAX_VISIBLE_DATASETS);
  const overflow = datasets.slice(MAX_VISIBLE_DATASETS);

  return (
    <li className="list-item">
      {t('scenarios:rules.screening_view.relevant_lists')}{' '}
      <span className="inline-flex flex-wrap items-center gap-xs">
        {visible.map((key) => (
          <Tag key={key} color="grey">
            {resolveName(key)}
          </Tag>
        ))}
        {overflow.length > 0 ? (
          <Popover.Root>
            <Popover.Trigger asChild>
              <Tag color="purple" className="cursor-pointer" onClick={stopPropagation}>
                {t('scenarios:rules.screening_view.datasets_overflow', { count: overflow.length })}
              </Tag>
            </Popover.Trigger>
            <Popover.Content align="start" sideOffset={4} onClick={stopPropagation}>
              <div className="flex max-h-[400px] flex-col items-start gap-xs overflow-auto p-md">
                {overflow.map((key) => (
                  <Tag key={key} color="grey">
                    {resolveName(key)}
                  </Tag>
                ))}
              </div>
            </Popover.Content>
          </Popover.Root>
        ) : null}
      </span>
    </li>
  );
};
