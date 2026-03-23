import { type CustomList } from '@app-builder/models/custom-list';
import { ScenarioPublicationStatus } from '@app-builder/models/scenario/publication';
import { type ScoringRulesetWithRules, type ScoringSettings } from '@app-builder/models/scoring';
import { GeneralInfoCard } from './GeneralInfoCard';
import { RulesTable } from './RulesTable';

interface ScoringRulesetPageProps {
  ruleset: ScoringRulesetWithRules;
  settings: ScoringSettings;
  customLists: CustomList[];
  preparationStatus: ScenarioPublicationStatus | null;
}

export function ScoringRulesetPage({ ruleset, settings, customLists, preparationStatus }: ScoringRulesetPageProps) {
  return (
    <div className="flex flex-col gap-v2-md">
      <GeneralInfoCard ruleset={ruleset} settings={settings} preparationStatus={preparationStatus} />
      <RulesTable ruleset={ruleset} maxRiskLevel={settings.maxRiskLevel} customLists={customLists} />
    </div>
  );
}
