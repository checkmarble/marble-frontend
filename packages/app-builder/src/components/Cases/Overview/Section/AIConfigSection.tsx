import { usePanel } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useGetAiSettingsQuery } from '@app-builder/queries/cases/get-ai-settings';
import { isAccessible, isRestricted } from '@app-builder/services/feature-access';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Tag } from 'ui-design-system';

import { ConfigRow } from '../ConfigRow';
import { AIConfigPanelContent } from '../Panel/AIConfigPanelContent';

interface AIConfigSectionProps {
  isGlobalAdmin: boolean;
  access: FeatureAccessLevelDto;
}

export function AIConfigSection({ isGlobalAdmin, access }: AIConfigSectionProps) {
  const { t } = useTranslation(['cases', 'settings']);
  const { openPanel, closePanel } = usePanel();
  const aiSettingsQuery = useGetAiSettingsQuery();

  const restricted = isRestricted(access);
  const hasAccess = isAccessible(access);
  const canEdit = hasAccess && isGlobalAdmin;

  const handleOpenPanel = () => {
    if (!aiSettingsQuery.data) return;

    openPanel(
      <AIConfigPanelContent
        settings={aiSettingsQuery.data.settings}
        readOnly={!canEdit}
        onSuccess={() => {
          closePanel();
          aiSettingsQuery.refetch();
        }}
      />,
    );
  };

  return (
    <div className="flex flex-col gap-v2-sm">
      {/* Section header */}
      <div className="flex items-center gap-v2-sm h-7">
        <span className="flex-1 text-s font-medium">{t('cases:overview.config.ai_title')}</span>
        {/* @TODO: Add credit usage when ready */}
        {/* <Tag color="purple" size="small" border="rounded-sm">
          5/10 crédit IA utilisés
        </Tag> */}
      </div>

      {match(aiSettingsQuery)
        .with({ isPending: true }, () => (
          <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex items-center justify-center min-h-[100px]">
            <Spinner />
          </div>
        ))
        .with({ isError: true }, () => (
          <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex items-center justify-center min-h-[100px] text-red-47">
            {t('cases:overview.config.error_loading')}
          </div>
        ))
        .with({ isSuccess: true }, ({ data }) => {
          const settings = data.settings;
          const isGeneralConfigured = settings.caseReviewSetting.orgDescription || settings.caseReviewSetting.structure;
          const isKycEnabled = settings.kycEnrichmentSetting.enabled;
          const isKycConfigured =
            isKycEnabled &&
            (settings.kycEnrichmentSetting.customInstructions ||
              settings.kycEnrichmentSetting.domainsFilter.length > 0);

          return (
            <>
              <ConfigRow
                isRestricted={restricted}
                canEdit={canEdit}
                label={t('cases:overview.config.general')}
                statusTag={
                  <Tag color={isGeneralConfigured ? 'green' : 'orange'} size="small" border="rounded-sm">
                    {isGeneralConfigured
                      ? t('cases:overview.config.configured')
                      : t('cases:overview.config.not_configured')}
                  </Tag>
                }
                editIcon="edit"
                onClick={handleOpenPanel}
              />
              <ConfigRow
                isRestricted={restricted}
                canEdit={canEdit}
                label={t('settings:ai_assist.case_manager.kyc_enrichment.title')}
                showWand
                statusTag={
                  <>
                    <Tag color={isKycEnabled ? 'green' : 'grey'} size="small" border="rounded-sm">
                      {isKycEnabled ? t('cases:overview.config.active') : t('cases:overview.config.inactive')}
                    </Tag>
                    {isKycEnabled && !isKycConfigured && (
                      <Tag color="orange" size="small" border="rounded-sm" className="whitespace-nowrap">
                        {t('cases:overview.config.not_configured')}
                      </Tag>
                    )}
                  </>
                }
                editIcon="arrow-right"
                onClick={handleOpenPanel}
              />
            </>
          );
        })
        .exhaustive()}
    </div>
  );
}
