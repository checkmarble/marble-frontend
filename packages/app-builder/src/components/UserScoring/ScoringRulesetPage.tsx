import { type CustomList } from '@app-builder/models/custom-list';
import { type ScoringRulesetWithRules, type ScoringSettings } from '@app-builder/models/scoring';
import { GeneralInfoCard } from './GeneralInfoCard';
import { RulesTable } from './RulesTable';

interface ScoringRulesetPageProps {
  ruleset: ScoringRulesetWithRules;
  settings: ScoringSettings;
  customLists: CustomList[];
}

export function ScoringRulesetPage({ ruleset, settings, customLists }: ScoringRulesetPageProps) {
  return (
    <div className="flex flex-col gap-v2-md">
      <GeneralInfoCard ruleset={ruleset} settings={settings} />
      <RulesTable ruleset={ruleset} maxRiskLevel={settings.maxRiskLevel} customLists={customLists} />
    </div>
  );
}
