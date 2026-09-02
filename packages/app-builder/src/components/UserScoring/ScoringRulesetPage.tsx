import { type CustomList } from '@app-builder/models/custom-list';
import { type ScenarioPublicationStatus } from '@app-builder/models/scenario/publication';
import { ScoringDryRun, type ScoringRulesetWithRules, type ScoringSettings } from '@app-builder/models/scoring';
import { cn } from 'ui-design-system';
import { pageLayoutGutter } from '../Page/page-layout';
import { GeneralInfoCard } from './GeneralInfoCard';
import { RulesTable } from './RulesTable';

interface ScoringRulesetPageProps {
  ruleset: ScoringRulesetWithRules;
  settings: ScoringSettings;
  customLists: CustomList[];
  preparationStatus: ScenarioPublicationStatus | null;
  hasValidLicense?: boolean;
  lastDryRun: ScoringDryRun | null;
}

export function ScoringRulesetPage({
  ruleset,
  settings,
  customLists,
  preparationStatus,
  hasValidLicense,
  lastDryRun,
}: ScoringRulesetPageProps) {
  return (
    <div className={cn('flex flex-col', pageLayoutGutter.gap)}>
      <GeneralInfoCard
        ruleset={ruleset}
        settings={settings}
        preparationStatus={preparationStatus}
        lastDryRun={lastDryRun}
      />
      <RulesTable
        ruleset={ruleset}
        maxRiskLevel={settings.maxRiskLevel}
        customLists={customLists}
        hasValidLicense={hasValidLicense}
      />
    </div>
  );
}
