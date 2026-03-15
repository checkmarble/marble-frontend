import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { NewSwitchAstNode, type SwitchAstNode } from '@app-builder/models/astNode/control-flow';
import {
  SCORING_LEVELS_COLORS,
  SCORING_LEVELS_LABELS,
  ScoringRule,
  ScoringRulesetWithRules,
  ScoringSettings,
} from '@app-builder/models/scoring';
import { useListScoringRulesetVersionsQuery } from '@app-builder/queries/scoring/list-ruleset-versions';
import { useFormatDateTime } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import clsx from 'clsx';
import { Fragment, type FunctionComponent, useState } from 'react';
import { Button, MenuCommand, SelectOption, SelectV2, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { PanelContainer, PanelHeader, PanelRoot } from '../Panel';

interface ScoringRulesetPageProps {
  ruleset: ScoringRulesetWithRules;
  settings: ScoringSettings | null;
}

export const ScoringRulesetPage: FunctionComponent<ScoringRulesetPageProps> = ({ ruleset, settings }) => {
  return (
    <div className="flex flex-col gap-v2-md">
      <GeneralInfoCard ruleset={ruleset} settings={settings} />
      <RulesTable rules={ruleset.rules} />
    </div>
  );
};

const GeneralInfoCard = ({
  ruleset,
  settings,
}: {
  ruleset: ScoringRulesetWithRules;
  settings: ScoringSettings | null;
}) => {
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
          <span className="text-h3 font-semibold text-grey-primary">Informations générales :</span>
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
          Dernière modification :{' '}
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

      {settings ? <RiskLevelBadges maxRiskLevel={settings.maxRiskLevel} thresholds={ruleset.thresholds} /> : null}
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
      <span className="text-s text-grey-secondary">Niveaux de risque :</span>
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
  { value: 'user_attributes', label: 'User attributes' },
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
  const [selectedType, setSelectedType] = useState<RuleType>('user_attributes');

  return (
    <MenuCommand.Content align="end" sideOffset={4} className="min-w-80">
      <MenuCommand.List className="p-v2-md">
        <MenuCommand.Group heading={<div className="mb-v2-md">Type of rule</div>}>
          <div className="flex flex-col gap-v2-sm">
            {RULE_TYPES.map(({ value, label }) => (
              <MenuCommand.HeadlessItem key={value} value={value} onSelect={() => setSelectedType(value)}>
                <div className="flex items-center gap-v2-sm">
                  <div
                    className={clsx(
                      'border-purple-primary flex size-4 shrink-0 items-center justify-center rounded-full border',
                      selectedType === value ? 'bg-purple-primary' : 'bg-white',
                    )}
                  >
                    {selectedType === value && <div className="size-2 rounded-full bg-white" />}
                  </div>
                  <span
                    className={clsx(
                      'text-s text-grey-primary',
                      selectedType === value ? 'font-semibold' : 'font-normal',
                    )}
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

function RulesTable({ rules }: { rules: ScoringRule[] }) {
  const [open, setOpen] = useState(false);
  const [panelNode, setPanelNode] = useState<SwitchAstNode | null>(null);

  const handleConfirm = (ruleType: RuleType) => {
    setPanelNode(NewSwitchAstNode(ruleType));
    setOpen(false);
  };

  return (
    <>
      <div className="bg-surface-card border-grey-border rounded-v2-md overflow-hidden border">
        <div className="border-grey-border flex items-center justify-between border-b px-v2-md py-v2-sm">
          <div className="text-s text-grey-secondary grid flex-1 grid-cols-[150px_1fr] gap-v2-md font-semibold">
            <span>Types de risques</span>
            <span>Règle</span>
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
          rules.map((rule) => <RuleRow key={rule.stableId} rule={rule} />)
        )}
      </div>
      <PanelRoot
        open={panelNode !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPanelNode(null);
        }}
      >
        {panelNode ? <AddRulePanel node={panelNode} /> : null}
      </PanelRoot>
    </>
  );
}

function AddRulePanel({ node }: { node: SwitchAstNode }) {
  return (
    <PanelContainer size="xl" className="flex-col gap-v2-md">
      <PanelHeader>New rule</PanelHeader>
      {/* AST builder will go here */}

      {JSON.stringify(node)}
    </PanelContainer>
  );
}

const RuleRow = ({ rule }: { rule: ScoringRule }) => (
  <div className="border-grey-border flex items-center border-b last:border-b-0">
    <div className="flex w-[150px] shrink-0 items-center px-v2-md py-v2-sm">
      <Tag color="grey">Risk type</Tag>
    </div>
    <div className="text-grey-primary text-s flex flex-1 items-center px-v2-md py-v2-sm font-medium">{rule.name}</div>
    <div className="flex shrink-0 items-center justify-end px-v2-md py-v2-sm">
      <button
        type="button"
        className="border-purple-primary text-purple-primary flex size-6 items-center justify-center rounded-lg border shadow-sm"
        aria-label="Edit rule"
      >
        <Icon icon="edit" className="size-4" />
      </button>
    </div>
  </div>
);

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
