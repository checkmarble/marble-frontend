import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { isSwitchAstNode, NewSwitchAstNode, type SwitchAstNode } from '@app-builder/models/astNode/control-flow';
import { type DataModel } from '@app-builder/models/data-model';
import {
  SCORING_LEVELS_COLORS,
  SCORING_LEVELS_LABELS,
  type ScoringRule,
  type ScoringRulesetWithRules,
  type ScoringSettings,
} from '@app-builder/models/scoring';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { useListScoringRulesetVersionsQuery } from '@app-builder/queries/scoring/list-ruleset-versions';
import { useUpdateScoringRulesetMutation } from '@app-builder/queries/scoring/update-ruleset';
import { useFormatDateTime } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { Fragment, useState } from 'react';
import { match } from 'ts-pattern';
import { Button, cn, MenuCommand, SelectOption, SelectV2, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { v7 as uuidv7 } from 'uuid';
import { PanelRoot } from '../Panel';
import { Spinner } from '../Spinner';
import { ScoringRuleEditPanel } from './ScoringRuleEditPanel';
import { SwitchNode } from './SwitchNode';

interface ScoringRulesetPageProps {
  ruleset: ScoringRulesetWithRules;
  settings: ScoringSettings;
}

export function ScoringRulesetPage({ ruleset, settings }: ScoringRulesetPageProps) {
  return (
    <div className="flex flex-col gap-v2-md">
      <GeneralInfoCard ruleset={ruleset} settings={settings} />
      <RulesTable ruleset={ruleset} maxRiskLevel={settings.maxRiskLevel} />
    </div>
  );
}

const GeneralInfoCard = ({ ruleset, settings }: { ruleset: ScoringRulesetWithRules; settings: ScoringSettings }) => {
  const navigate = useAgnosticNavigation();
  const formatDateTime = useFormatDateTime();
  const cooldownLabel = formatCooldown(ruleset.cooldownSeconds);
  const versionsQuery = useListScoringRulesetVersionsQuery(ruleset.recordType);
  const versionOptions: SelectOption<string>[] = (versionsQuery.data?.versions ?? []).map((v) => ({
    value: v.status === 'committed' ? v.version.toString() : 'draft',
    label: v.status === 'committed' ? `V${v.version}` : 'draft',
  }));

  const handleVersionChange = (version: string) => {
    navigate(getRoute('/user-scoring/:recordType/:version', { recordType: ruleset.recordType, version }));
  };

  return (
    <div className="bg-surface-card border border-grey-border rounded-v2-md p-v2-md flex flex-col gap-v2-md">
      <div className="flex items-center justify-between gap-v2-sm">
        <div>
          <span className="text-h3 font-semibold text-grey-primary">Global Informations:</span>
        </div>
        <div className="flex items-center gap-v2-sm">
          <SelectV2
            options={versionOptions}
            placeholder="Version"
            value={ruleset.status === 'draft' ? 'draft' : ruleset.version.toString()}
            onChange={handleVersionChange}
            variant="tag"
            menuClassName="min-w-30"
          />
          <button
            type="button"
            className="text-grey-secondary hover:text-grey-primary transition-colors"
            aria-label="Edit"
          >
            <Icon icon="edit" className="size-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-v2-md text-s text-grey-secondary">
        <span>
          Last update:{' '}
          <span className="text-grey-primary">
            {formatDateTime(ruleset.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </span>
        {cooldownLabel ? (
          <>
            <span className="text-grey-border">|</span>
            <span>
              Cooldown : <span className="text-grey-primary">{cooldownLabel}</span>
            </span>
          </>
        ) : null}
      </div>

      <RiskLevelBadges maxRiskLevel={settings.maxRiskLevel} thresholds={ruleset.thresholds} />
    </div>
  );
};

const RiskLevelBadges = ({ maxRiskLevel, thresholds }: { maxRiskLevel: number; thresholds: number[] }) => {
  if (!(maxRiskLevel in SCORING_LEVELS_COLORS) || !(maxRiskLevel in SCORING_LEVELS_LABELS)) {
    return null;
  }

  const colors = SCORING_LEVELS_COLORS[maxRiskLevel as keyof typeof SCORING_LEVELS_COLORS];
  const labels = SCORING_LEVELS_LABELS[maxRiskLevel as keyof typeof SCORING_LEVELS_LABELS];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-s text-grey-secondary">Level of risk :</span>
      <div className="flex items-center gap-3">
        {colors.map((color, i) => {
          const isLast = i === maxRiskLevel - 1;
          return (
            <Fragment key={color}>
              <div
                className="flex items-center gap-1 h-6 px-2 rounded-full bg-white border"
                style={{ borderColor: color }}
              >
                <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs text-grey-primary">{labels[i]}</span>
              </div>
              {!isLast ? (
                <span className="text-xs font-medium text-grey-placeholder">{`≤ ${thresholds[i]} <`}</span>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

const RULE_TYPES = [
  { value: 'user_attribute', label: 'User attribute' },
  { value: 'aggregates', label: 'Agregates (transaction, event, ...)' },
  { value: 'tags', label: 'Tags' },
  { value: 'screening', label: 'Screening (PEP, Sanction, ...)' },
  { value: 'past_alerts', label: 'Past alerts' },
] as const;

type RuleType = (typeof RULE_TYPES)[number]['value'];

function AddRuleMenuContent({
  onConfirm,
  onCancel,
}: {
  onConfirm: (ruleType: RuleType) => void;
  onCancel: () => void;
}) {
  const [selectedType, setSelectedType] = useState<RuleType>('user_attribute');

  return (
    <MenuCommand.Content align="end" sideOffset={4} className="min-w-80">
      <MenuCommand.List className="p-v2-md">
        <MenuCommand.Group heading={<div className="mb-v2-md">Type of rule</div>}>
          <div className="flex flex-col gap-v2-sm">
            {RULE_TYPES.map(({ value, label }) => (
              <MenuCommand.HeadlessItem key={value} value={value} onSelect={() => setSelectedType(value)}>
                <div className="flex items-center gap-v2-sm">
                  <div
                    className={cn(
                      'border-purple-primary flex size-4 shrink-0 items-center justify-center rounded-full border',
                      selectedType === value ? 'bg-purple-primary' : 'bg-white',
                    )}
                  >
                    {selectedType === value && <div className="size-2 rounded-full bg-white" />}
                  </div>
                  <span
                    className={cn('text-s text-grey-primary', selectedType === value ? 'font-semibold' : 'font-normal')}
                  >
                    {label}
                  </span>
                </div>
              </MenuCommand.HeadlessItem>
            ))}
          </div>
        </MenuCommand.Group>
      </MenuCommand.List>
      <div className="border-grey-border flex items-center justify-end gap-v2-sm border-t p-v2-sm">
        <Button variant="secondary" size="small" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="small" onClick={() => onConfirm(selectedType)}>
          Create rule
        </Button>
      </div>
    </MenuCommand.Content>
  );
}

function RulesTable({ ruleset, maxRiskLevel }: { ruleset: ScoringRulesetWithRules; maxRiskLevel: number }) {
  const revalidate = useLoaderRevalidator();
  const { rules, recordType: entityType } = ruleset;
  const [open, setOpen] = useState(false);
  const [panelNode, setPanelNode] = useState<SwitchAstNode | null>(null);
  const dataModelQuery = useDataModelQuery();
  const mutation = useUpdateScoringRulesetMutation();

  const handleConfirm = (ruleType: RuleType) => {
    setPanelNode(NewSwitchAstNode(ruleType));
    setOpen(false);
  };

  const handleRuleChange = (stableId: string, newAstNode: SwitchAstNode) => {
    mutation
      .mutateAsync({
        recordType: ruleset.recordType,
        name: ruleset.name,
        thresholds: ruleset.thresholds,
        cooldownSeconds: ruleset.cooldownSeconds,
        rules: ruleset.rules.map((r) => ({
          stableId: r.stableId,
          name: r.name,
          description: r.description,
          ast: r.stableId === stableId ? newAstNode : r.ast,
        })),
      })
      .then(() => {
        revalidate();
      });
  };

  const handleRuleAdd = (newAstNode: SwitchAstNode) => {
    mutation
      .mutateAsync({
        recordType: ruleset.recordType,
        name: ruleset.name,
        thresholds: ruleset.thresholds,
        cooldownSeconds: ruleset.cooldownSeconds,
        rules: [
          ...ruleset.rules.map((r) => ({
            stableId: r.stableId,
            name: r.name,
            description: r.description,
            ast: r.ast,
          })),
          {
            stableId: uuidv7(),
            name: 'New rule',
            description: '',
            ast: newAstNode,
          },
        ],
      })
      .then(() => {
        revalidate();
        setPanelNode(null);
      });
  };

  return (
    <>
      <div className="bg-surface-card border-grey-border rounded-v2-md overflow-hidden border">
        <div className="border-grey-border flex items-center justify-between border-b px-v2-md py-v2-sm">
          <div className="text-s text-grey-secondary grid flex-1 grid-cols-[150px_1fr] gap-v2-md font-semibold">
            <span>Risk types</span>
            <span>Rules</span>
          </div>
          <MenuCommand.Menu open={open} onOpenChange={setOpen} persistOnSelect>
            <MenuCommand.Trigger>
              <Button variant="secondary">
                <Icon icon="plus" className="size-4" />
                Add rule
              </Button>
            </MenuCommand.Trigger>
            <AddRuleMenuContent onConfirm={handleConfirm} onCancel={() => setOpen(false)} />
          </MenuCommand.Menu>
        </div>
        {rules.length === 0 ? (
          <div className="text-s text-grey-secondary flex items-center justify-center py-v2-xl">
            No rules configured yet.
          </div>
        ) : (
          match(dataModelQuery)
            .with({ isPending: true }, () => (
              <div className="flex items-center justify-center py-v2-xl">
                <Spinner />
              </div>
            ))
            .with({ isError: true }, () => (
              <div className="text-s text-red-primary flex items-center justify-center py-v2-xl">
                Une erreur est survenue.
              </div>
            ))
            .with({ isSuccess: true }, ({ data: { dataModel } }) =>
              rules.map((rule) => (
                <RuleRow
                  key={rule.stableId}
                  rule={rule}
                  dataModel={dataModel}
                  entityType={entityType}
                  maxRiskLevel={maxRiskLevel}
                  onRuleChange={(newNode) => handleRuleChange(rule.stableId, newNode)}
                />
              )),
            )
            .exhaustive()
        )}
      </div>
      <PanelRoot
        open={panelNode !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPanelNode(null);
        }}
      >
        {panelNode && dataModelQuery.data ? (
          <ScoringRuleEditPanel
            node={panelNode}
            dataModel={dataModelQuery.data.dataModel}
            entityType={entityType}
            maxRiskLevel={maxRiskLevel}
            onChange={handleRuleAdd}
          />
        ) : null}
      </PanelRoot>
    </>
  );
}

const RuleRow = ({
  rule,
  dataModel,
  entityType,
  maxRiskLevel,
  onRuleChange,
}: {
  rule: ScoringRule;
  dataModel: DataModel;
  entityType: string;
  maxRiskLevel: number;
  onRuleChange?: (node: SwitchAstNode) => void;
}) => {
  const switchNode = rule.ast && isSwitchAstNode(rule.ast) ? rule.ast : null;
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="border-grey-border flex border-b last:border-b-0">
      <div className="flex w-[150px] shrink-0 items-center px-v2-md py-v2-sm">
        <Tag color="grey">Risk type</Tag>
      </div>
      <div className="flex flex-1 flex-col gap-v2-sm px-v2-md py-v2-sm">
        <span className="text-grey-primary text-s font-medium">{rule.name}</span>
        {switchNode ? (
          <SwitchNode
            node={switchNode}
            mode="view"
            dataModel={dataModel}
            entityType={entityType}
            maxRiskLevel={maxRiskLevel}
          />
        ) : null}
      </div>
      {switchNode ? (
        <div className="flex shrink-0 items-center justify-end px-v2-md py-v2-sm">
          <button
            type="button"
            className="border-purple-primary text-purple-primary flex size-6 items-center justify-center rounded-lg border shadow-sm"
            aria-label="Edit rule"
            onClick={() => setIsEditing(true)}
          >
            <Icon icon="edit" className="size-4" />
          </button>
          <PanelRoot open={isEditing} onOpenChange={setIsEditing}>
            <ScoringRuleEditPanel
              node={switchNode}
              dataModel={dataModel}
              entityType={entityType}
              maxRiskLevel={maxRiskLevel}
              onChange={onRuleChange}
            />
          </PanelRoot>
        </div>
      ) : null}
    </div>
  );
};

function formatCooldown(seconds: number): string | null {
  if (!seconds) return null;
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0 && hours > 0) return `${days}j ${hours}h`;
  if (days > 0) return `${days}j`;
  if (hours > 0) return `${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  if (minutes > 0) return `${minutes}min`;
  return `${seconds}s`;
}
