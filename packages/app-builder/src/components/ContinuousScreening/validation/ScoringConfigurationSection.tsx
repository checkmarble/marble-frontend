import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';
import { EditionValidationPanelProps } from '../EditionValidationPanel';

export const ScoringConfigurationSection = ({ updatedConfig, baseConfig }: EditionValidationPanelProps) => {
  const { t } = useTranslation(['continuousScreening', 'screenings']);
  const hasMatchThresholdChanged = updatedConfig.matchThreshold !== baseConfig.matchThreshold;
  const hasMatchLimitChanged = updatedConfig.matchLimit !== baseConfig.matchLimit;

  if (!hasMatchThresholdChanged && !hasMatchLimitChanged) {
    return null;
  }

  return (
    <Collapsible.Container>
      <Collapsible.Title>{t('continuousScreening:edition.validation.scoringConfiguration.title')}</Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-v2-sm">
          {hasMatchThresholdChanged ? (
            <div className="flex items-center gap-v2-sm">
              <span>{t('screenings:match_threshold')}</span>
              <span>{updatedConfig.matchThreshold}</span>
              <span className="line-through text-grey-secondary">{baseConfig.matchThreshold}</span>
            </div>
          ) : null}
          {hasMatchLimitChanged ? (
            <div className="flex items-center gap-v2-sm">
              <span>{t('screenings:match_limit')}</span>
              <span>{updatedConfig.matchLimit}</span>
              <span className="line-through text-grey-secondary">{baseConfig.matchLimit}</span>
            </div>
          ) : null}
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
