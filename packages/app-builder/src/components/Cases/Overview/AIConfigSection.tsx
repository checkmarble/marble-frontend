import { usePanel } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useGetAiSettingsQuery } from '@app-builder/queries/cases/get-ai-settings';
import { match } from 'ts-pattern';
import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { AIConfigPanelContent } from './Panel/AIConfigPanelContent';

export function AIConfigSection() {
  const { openPanel, closePanel } = usePanel();
  const aiSettingsQuery = useGetAiSettingsQuery();

  const handleOpenPanel = () => {
    if (!aiSettingsQuery.data) return;

    openPanel(
      <AIConfigPanelContent
        settings={aiSettingsQuery.data.settings}
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
        <span className="flex-1 text-s font-medium">Configurations IA</span>
        <Tag color="purple" size="small" border="rounded-sm">
          5/10 crédit IA utilisés
        </Tag>
      </div>

      {match(aiSettingsQuery)
        .with({ isPending: true }, () => (
          <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex items-center justify-center min-h-[100px]">
            <Spinner />
          </div>
        ))
        .with({ isError: true }, () => (
          <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex items-center justify-center min-h-[100px] text-red-47">
            Erreur de chargement
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
              {/* Général panel */}
              <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex flex-col gap-v2-md">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center gap-v2-xs">
                    <span className="text-s font-medium">Général</span>
                    <Tag color={isGeneralConfigured ? 'green' : 'orange'} size="small" border="rounded-sm">
                      {isGeneralConfigured ? 'Configuré' : 'A configurer'}
                    </Tag>
                  </div>
                  <button
                    type="button"
                    className="size-6 flex items-center justify-center text-purple-65 hover:text-purple-60"
                    onClick={handleOpenPanel}
                  >
                    <Icon icon="edit" className="size-4" />
                  </button>
                </div>
              </div>

              {/* AI case review KYC enrichment panel */}
              <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex flex-col gap-v2-md">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center gap-v2-xs">
                    <span className="text-s font-medium">AI case review KYC enrichment</span>
                    <Tag color={isKycEnabled ? 'green' : 'grey'} size="small" border="rounded-sm">
                      {isKycEnabled ? 'Actif' : 'Inactif'}
                    </Tag>
                    {isKycEnabled && !isKycConfigured && (
                      <Tag color="orange" size="small" border="rounded-sm" className="whitespace-nowrap">
                        A configurer
                      </Tag>
                    )}
                  </div>
                  <button
                    type="button"
                    className="size-6 flex items-center justify-center text-purple-65 hover:text-purple-60"
                    onClick={handleOpenPanel}
                  >
                    <Icon icon="arrow-right" className="size-4" />
                  </button>
                </div>
              </div>
            </>
          );
        })
        .exhaustive()}
    </div>
  );
}
