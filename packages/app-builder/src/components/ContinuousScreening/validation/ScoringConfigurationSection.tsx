import { Spinner } from '@app-builder/components/Spinner';
import {
  ContinuousScreeningConfig,
  PrevalidationCreateContinuousScreeningConfig,
} from '@app-builder/models/continuous-screening';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Collapsible } from 'ui-design-system';
import { EditionValidationPanelBaseProps } from '../EditionValidationPanel';

export const ScoringConfigurationSection = ({ updatedConfig, baseConfig }: EditionValidationPanelBaseProps) => {
  const { t } = useTranslation(['continuousScreening', 'screenings']);
  const hasMatchThresholdChanged = updatedConfig.matchThreshold !== baseConfig.matchThreshold;
  const hasMatchLimitChanged = updatedConfig.matchLimit !== baseConfig.matchLimit;

  return (
    <Collapsible.Container>
      <Collapsible.Title>{t('continuousScreening:edition.validation.scoringConfiguration.title')}</Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-v2-sm">
          <div className="grid grid-cols-[140px_1fr] gap-v2-sm items-center">
            <span>{t('screenings:match_threshold')}</span>
            <div className="flex items-center gap-v2-sm">
              {hasMatchThresholdChanged ? (
                <>
                  <span className="line-through text-grey-secondary">{baseConfig.matchThreshold}</span>
                  <span>-&gt;</span>
                </>
              ) : null}
              <span>{updatedConfig.matchThreshold}</span>
            </div>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-v2-sm items-center">
            <span>{t('screenings:match_limit')}</span>
            <div className="flex items-center gap-v2-sm">
              {hasMatchLimitChanged ? (
                <>
                  <span className="line-through text-grey-secondary">{baseConfig.matchLimit}</span>
                  <span>-&gt;</span>
                </>
              ) : null}
              <span>{updatedConfig.matchLimit}</span>
            </div>
          </div>
          <InboxDiff updatedConfig={updatedConfig} baseConfig={baseConfig} />
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};

const InboxDiff = ({
  updatedConfig,
  baseConfig,
}: {
  updatedConfig: PrevalidationCreateContinuousScreeningConfig;
  baseConfig: ContinuousScreeningConfig;
}) => {
  const { t } = useTranslation(['continuousScreening']);
  const inboxesQuery = useGetInboxesQuery();
  const hasInboxChanged = updatedConfig.inboxId !== baseConfig.inboxId;

  return (
    <div className="grid grid-cols-[140px_1fr] gap-v2-sm items-center">
      <span>{t('continuousScreening:field.inbox.label')}</span>
      <div className="flex items-center gap-v2-sm">
        {match(inboxesQuery)
          .with({ isPending: true }, () => <Spinner className="size-4" />)
          .with({ isError: true }, () => <div>{t('common:generic_fetch_data_error')}</div>)
          .with({ isSuccess: true }, ({ data }) => {
            if (!data) return null;
            const inboxes = data.inboxes;

            const baseInboxName = inboxes.find((inbox) => inbox.id === baseConfig.inboxId)?.name;
            const updatedInboxName = inboxes.find((inbox) => inbox.id === updatedConfig.inboxId)?.name;

            return (
              <>
                {hasInboxChanged ? (
                  <>
                    <span className="line-through text-grey-secondary">{baseInboxName}</span>
                    <span>-&gt;</span>
                  </>
                ) : null}
                <span>{updatedConfig.inboxId ? updatedInboxName : updatedConfig.inboxName}</span>
              </>
            );
          })
          .exhaustive()}
      </div>
    </div>
  );
};
