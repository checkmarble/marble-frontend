import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { computed } from '@preact/signals-react';
import { useTranslation } from 'react-i18next';
import { ContinuousScreeningCreationStepper } from '../../context/CreationStepper';
import { RecapCapsule, RecapRow } from '../../shared/RecapRow';

export const ScoringConfigurationRecap = () => {
  const { t } = useTranslation(['continuousScreening']);
  const inboxesQuery = useGetInboxesQuery();
  const inboxId = ContinuousScreeningCreationStepper.select((state) => state.data.$inboxId);
  const inboxName = ContinuousScreeningCreationStepper.select((state) => state.data.$inboxName);
  const matchThreshold = ContinuousScreeningCreationStepper.select((state) => state.data.matchThreshold);
  const matchLimit = ContinuousScreeningCreationStepper.select((state) => state.data.matchLimit);

  const inboxDisplayName = computed(() => {
    if (inboxName.value) {
      return inboxName.value;
    }

    return inboxesQuery.data?.inboxes.find((inbox) => inbox.id === inboxId.value)?.name;
  });

  return (
    <RecapRow>
      <span>{t('continuousScreening:creation.scoringConfiguration.recap.title')}</span>
      <div className="flex flex-row items-center gap-v2-xs h-[25px]">
        {!isNaN(matchThreshold) ? (
          <RecapCapsule>
            {t('continuousScreening:creation.scoringConfiguration.recap.matchThreshold', { score: matchThreshold })}
          </RecapCapsule>
        ) : null}
        {!isNaN(matchLimit) ? (
          <RecapCapsule>
            {t('continuousScreening:creation.scoringConfiguration.recap.matchLimit', { limit: matchLimit })}
          </RecapCapsule>
        ) : null}
        {inboxId.value || inboxName.value ? (
          <RecapCapsule>
            {t('continuousScreening:creation.scoringConfiguration.recap.inbox', {
              inbox: inboxDisplayName.value,
            })}
          </RecapCapsule>
        ) : null}
      </div>
    </RecapRow>
  );
};
