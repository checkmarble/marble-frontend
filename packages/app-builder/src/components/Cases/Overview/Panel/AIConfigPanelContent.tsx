import { CalloutV2 } from '@app-builder/components/Callout';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { FormTextArea } from '@app-builder/components/Form/Tanstack/FormTextArea';
import { PanelContainer, PanelContent, PanelFooter, PanelHeader } from '@app-builder/components/Panel';
import { PanelOverlay } from '@app-builder/components/Panel/PanelOverlay';
import { type AiSettingSchema, aiSettingSchema } from '@app-builder/models/ai-settings';
import { useUpdateAiSettings } from '@app-builder/queries/settings/ai/update';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { Trans, useTranslation } from 'react-i18next';
import { ButtonV2, Input, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { LanguageDropdown } from './LanguageDropdown';

interface AIConfigPanelContentProps {
  settings: AiSettingSchema;
  onSuccess?: () => void;
  readOnly?: boolean;
}

export function AIConfigPanelContent({ settings, onSuccess, readOnly }: AIConfigPanelContentProps) {
  const { t } = useTranslation(['settings', 'common']);
  const updateMutation = useUpdateAiSettings();

  const form = useForm({
    defaultValues: {
      caseReviewSetting: {
        language: settings.caseReviewSetting.language || 'en',
        structure: settings.caseReviewSetting.structure || '',
        orgDescription: settings.caseReviewSetting.orgDescription || '',
      },
      kycEnrichmentSetting: {
        enabled: settings.kycEnrichmentSetting.enabled,
        customInstructions: settings.kycEnrichmentSetting.customInstructions || '',
        domainsFilter: settings.kycEnrichmentSetting.domainsFilter || [],
      },
    },
    validators: {
      onSubmit: aiSettingSchema,
    },
    onSubmit: ({ value }) => {
      return updateMutation.mutateAsync(value).then(() => {
        onSuccess?.();
      });
    },
  });

  return (
    <PanelOverlay>
      <PanelContainer size="xxl">
        <PanelHeader>
          <div className="flex items-center gap-v2-sm">
            <Icon icon="left-panel-open" className="size-4" />
            <span>Configuration IA</span>
          </div>
        </PanelHeader>

        <PanelContent>
          <form id="ai-config-panel-form" className="flex flex-col gap-v2-sm" onSubmit={handleSubmit(form)}>
            {/* Section: Informations générales */}
            <div className="bg-grey-background-light border border-grey-border rounded-v2-lg p-v2-md flex flex-col gap-v2-md">
              <span className="text-s font-medium">{t('settings:ai_assist.case_manager.general.title')}</span>
              <form.Field name="caseReviewSetting.orgDescription">
                {(field) => (
                  <div className="flex flex-col gap-v2-xs">
                    <FormLabel name={field.name} className="text-xs">
                      {t('settings:ai_assist.case_manager.general.org_description.field.label')}
                    </FormLabel>
                    <FormTextArea
                      name={field.name}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      defaultValue={field.state.value}
                      valid={field.state.meta.errors.length === 0}
                      resize="vertical"
                      className="min-h-[140px] disabled:cursor-not-allowed"
                      placeholder={t('settings:ai_assist.case_manager.general.org_description.field.placeholder')}
                      disabled={readOnly}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="caseReviewSetting.structure">
                {(field) => (
                  <div className="flex flex-col gap-v2-xs">
                    <FormLabel name={field.name} className="text-xs">
                      {t('settings:ai_assist.case_manager.general.structure.field.label')}
                    </FormLabel>
                    <FormTextArea
                      name={field.name}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      defaultValue={field.state.value}
                      valid={field.state.meta.errors.length === 0}
                      resize="vertical"
                      className="min-h-[140px] disabled:cursor-not-allowed"
                      placeholder={t('settings:ai_assist.case_manager.general.structure.field.placeholder')}
                      disabled={readOnly}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="caseReviewSetting.language">
                {(field) => (
                  <LanguageDropdown
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                    disabled={readOnly}
                  />
                )}
              </form.Field>
            </div>

            {/* Section: IA (KYC Enrichment) */}
            <div className="bg-grey-background-light border border-grey-border rounded-v2-lg p-v2-md flex flex-col gap-v2-md">
              <span className="text-s font-medium">IA</span>
              <form.Field name="kycEnrichmentSetting.enabled">
                {(field) => (
                  <div className="flex gap-2 text-pretty">
                    <Switch
                      className="shrink-0"
                      checked={field.state.value}
                      onCheckedChange={(val) => field.handleChange(val)}
                      disabled={readOnly}
                    />
                    <div className="flex flex-col gap-v2-xs">
                      <span className="text-s font-medium">
                        {t('settings:ai_assist.case_manager.kyc_enrichment.title')}
                      </span>
                      <div className="text-s text-grey-50">
                        <Trans
                          t={t}
                          i18nKey="ai_assist.case_manager.kyc_enrichment.enabled.field.label"
                          components={{
                            bold: <span className="font-semibold" />,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </form.Field>

              <form.Field name="kycEnrichmentSetting.customInstructions">
                {(field) => (
                  <div className="flex flex-col gap-v2-xs">
                    <FormLabel name={field.name} className="text-xs">
                      {t('settings:ai_assist.case_manager.kyc_enrichment.custom_instructions.field.label')}
                    </FormLabel>
                    <FormTextArea
                      name={field.name}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      defaultValue={field.state.value}
                      valid={field.state.meta.errors.length === 0}
                      resize="vertical"
                      className="min-h-[140px] disabled:cursor-not-allowed"
                      placeholder={t(
                        'settings:ai_assist.case_manager.kyc_enrichment.custom_instructions.field.placeholder',
                      )}
                      disabled={readOnly}
                    />
                  </div>
                )}
              </form.Field>

              <CalloutV2>{t('settings:ai_assist.case_manager.kyc_enrichment_callout')}</CalloutV2>

              <form.Field name="kycEnrichmentSetting.domainsFilter" mode="array">
                {(domainsField) => (
                  <div className="flex flex-col gap-v2-sm">
                    {domainsField.state.value.map((_, idx) => (
                      <form.Field key={idx} name={`kycEnrichmentSetting.domainsFilter[${idx}]`}>
                        {(field) => (
                          <div className="flex flex-col gap-v2-xs">
                            <div className="flex gap-v2-sm items-center">
                              <Input
                                className="flex-1 [&>input]:disabled:cursor-not-allowed"
                                value={field.state.value}
                                onChange={(e) => {
                                  field.handleChange(e.target.value);
                                  domainsField.validate('change');
                                }}
                                placeholder={t('settings:ai_assist.case_manager.domains_filter.placeholder')}
                                disabled={readOnly}
                              />
                              {!readOnly && (
                                <ButtonV2
                                  mode="icon"
                                  variant="secondary"
                                  type="button"
                                  onClick={() => domainsField.removeValue(idx)}
                                >
                                  <Icon icon="delete" className="size-4 text-purple-65" />
                                </ButtonV2>
                              )}
                            </div>
                            <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                          </div>
                        )}
                      </form.Field>
                    ))}

                    {!readOnly && (
                      <ButtonV2
                        type="button"
                        variant="primary"
                        appearance="stroked"
                        disabled={domainsField.state.value.length >= 10}
                        onClick={() => domainsField.pushValue('')}
                        className="w-fit"
                      >
                        {t('settings:ai_assist.case_manager.kyc_enrichment.add_new.button')}
                      </ButtonV2>
                    )}
                  </div>
                )}
              </form.Field>
            </div>
          </form>
        </PanelContent>

        {!readOnly && (
          <PanelFooter>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => {
                const isPending = isSubmitting || updateMutation.isPending;
                return (
                  <ButtonV2
                    type="submit"
                    form="ai-config-panel-form"
                    variant="primary"
                    size="default"
                    className="w-full justify-center"
                    disabled={isPending}
                  >
                    {isPending ? <Icon icon="spinner" className="size-4 animate-spin" /> : 'Valider la configuration'}
                  </ButtonV2>
                );
              }}
            </form.Subscribe>
          </PanelFooter>
        )}
      </PanelContainer>
    </PanelOverlay>
  );
}
