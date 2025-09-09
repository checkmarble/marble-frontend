import { CalloutV2 } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormError } from '@app-builder/components/Form/Tanstack/FormError';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { FormTextArea } from '@app-builder/components/Form/Tanstack/FormTextArea';
import { Page } from '@app-builder/components/Page';
import { CollapsiblePaper } from '@app-builder/components/Paper';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type AiSettingSchema, aiSettingSchema, languages } from '@app-builder/models/ai-settings';
import { useUpdateAiSettings } from '@app-builder/queries/settings/ai/update';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { Trans, useTranslation } from 'react-i18next';
import { ButtonV2, Input, MenuCommand, Switch, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function AiAssistSettingsPage({ settings }: { settings: AiSettingSchema }) {
  const { t } = useTranslation(['settings', 'common']);

  const updateAiSettingsMutation = useUpdateAiSettings();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    onSubmit: ({ value }) => {
      return updateAiSettingsMutation
        .mutateAsync(value)
        .then(() => {
          revalidate();
        })
        .catch((error) => {
          console.error('Error updating AI settings', error);
        });
    },
    validators: {
      onSubmit: aiSettingSchema,
    },
    defaultValues: {
      caseReviewSetting: {
        language: settings.caseReviewSetting.language || 'en-US',
        structure: settings.caseReviewSetting.structure || '',
        orgDescription: settings.caseReviewSetting.orgDescription || '',
      },
      kycEnrichmentSetting: {
        enabled: settings.kycEnrichmentSetting.enabled,
        domainsFilter: settings.kycEnrichmentSetting.domainsFilter || [],
      },
    },
  });
  return (
    <Page.Container>
      <Page.Content className="max-w-(--breakpoint-xl)">
        <form id="ai-settings-form" className="flex flex-col gap-4" onSubmit={handleSubmit(form)}>
          <CollapsiblePaper.Container>
            <CollapsiblePaper.Title>
              <span className="flex-1">{t('settings:ai_assist.case_manager.general.title')}</span>
            </CollapsiblePaper.Title>
            <CollapsiblePaper.Content>
              <div className="flex flex-col gap-8">
                <form.Field name="caseReviewSetting.orgDescription">
                  {(field) => (
                    <div className="group flex w-full flex-col gap-2">
                      <FormLabel name={field.name} className="flex items-center gap-2">
                        {t('settings:ai_assist.case_manager.general.org_description.field.label')}
                        <Tooltip.Default
                          className="max-w-96"
                          content={
                            <span className="font-normal text-pretty">
                              {t(
                                'settings:ai_assist.case_manager.general.org_description.field.tooltip',
                              )}
                            </span>
                          }
                        >
                          <Icon
                            icon="tip"
                            className="size-4 shrink-0 cursor-pointer text-purple-65"
                          />
                        </Tooltip.Default>
                      </FormLabel>

                      <FormTextArea
                        name={field.name}
                        onChange={(e) => field.handleChange(e.currentTarget.value)}
                        onBlur={field.handleBlur}
                        defaultValue={field.state.value}
                        valid={field.state.meta.errors.length === 0}
                        resize="vertical"
                        className="min-h-24"
                        placeholder={t(
                          'settings:ai_assist.case_manager.general.org_description.field.placeholder',
                        )}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="caseReviewSetting.language">
                  {(field) => (
                    <div className="group flex w-full flex-col gap-2">
                      <FormLabel name={field.name} className="flex items-center gap-2">
                        {t('settings:ai_assist.case_manager.general.language.field.label')}
                        <Tooltip.Default
                          className="max-w-96"
                          content={
                            <span className="font-normal">
                              {t('settings:ai_assist.case_manager.general.language.field.tooltip')}
                            </span>
                          }
                        >
                          <Icon
                            icon="tip"
                            className="size-4 shrink-0 cursor-pointer text-purple-65"
                          />
                        </Tooltip.Default>
                      </FormLabel>
                      <MenuCommand.Menu>
                        <MenuCommand.Trigger>
                          <MenuCommand.SelectButton>
                            {languages.get(field.state.value)}
                          </MenuCommand.SelectButton>
                        </MenuCommand.Trigger>

                        <MenuCommand.Content
                          sameWidth
                          sideOffset={4}
                          align="start"
                          className="min-w-24"
                        >
                          <MenuCommand.List>
                            {Array.from(languages.entries()).map(([code, language]) => (
                              <MenuCommand.Item
                                key={code}
                                value={code}
                                onSelect={() => field.handleChange(code)}
                              >
                                {language}
                              </MenuCommand.Item>
                            ))}
                          </MenuCommand.List>
                        </MenuCommand.Content>
                      </MenuCommand.Menu>
                    </div>
                  )}
                </form.Field>
                <form.Field name="caseReviewSetting.structure">
                  {(field) => (
                    <div className="group flex w-full flex-col gap-2">
                      <FormLabel name={field.name} className="flex items-center gap-2">
                        {t('settings:ai_assist.case_manager.general.structure.field.label')}
                        <Tooltip.Default
                          className="max-w-96"
                          content={
                            <span className="font-normal">
                              <Trans
                                t={t}
                                i18nKey="ai_assist.case_manager.general.structure.field.tooltip"
                                components={{
                                  DocLink: (
                                    <ExternalLink href="https://www.markdownguide.org/basic-syntax/" />
                                  ),
                                }}
                              />
                            </span>
                          }
                        >
                          <Icon
                            icon="tip"
                            className="size-4 shrink-0 cursor-pointer text-purple-65"
                          />
                        </Tooltip.Default>
                      </FormLabel>
                      <FormTextArea
                        name={field.name}
                        onChange={(e) => field.handleChange(e.currentTarget.value)}
                        onBlur={field.handleBlur}
                        defaultValue={field.state.value}
                        valid={field.state.meta.errors.length === 0}
                        resize="vertical"
                        className="min-h-24"
                        placeholder={t(
                          'settings:ai_assist.case_manager.general.structure.field.placeholder',
                        )}
                      />
                    </div>
                  )}
                </form.Field>
              </div>
            </CollapsiblePaper.Content>
          </CollapsiblePaper.Container>
          <CollapsiblePaper.Container>
            <CollapsiblePaper.Title>
              <span className="flex-1">
                {t('settings:ai_assist.case_manager.kyc_enrichment.title')}
              </span>
            </CollapsiblePaper.Title>
            <CollapsiblePaper.Content>
              <div className="flex flex-col gap-8">
                <form.Field name="kycEnrichmentSetting.enabled">
                  {(field) => (
                    <>
                      <div className="group flex w-full flex-row gap-4 text-pretty">
                        <Switch checked={field.state.value} onCheckedChange={field.handleChange} />
                        <FormLabel name={field.name}>
                          <Trans
                            t={t}
                            i18nKey="ai_assist.case_manager.kyc_enrichment.enabled.field.label"
                            components={{
                              bold: <span className="font-bold" />,
                            }}
                          />
                        </FormLabel>
                      </div>
                    </>
                  )}
                </form.Field>

                <CalloutV2>{t('settings:ai_assist.case_manager.kyc_enrichment_callout')}</CalloutV2>
                <form.Field name="kycEnrichmentSetting.domainsFilter" mode="array">
                  {(domainsFilterField) => (
                    <form.Subscribe selector={(state) => state.values.kycEnrichmentSetting.enabled}>
                      {(isEnabled) => (
                        <>
                          {domainsFilterField.state.value.map((_, idx) => (
                            <form.Field
                              key={idx}
                              name={`kycEnrichmentSetting.domainsFilter[${idx}]`}
                            >
                              {(field) => (
                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-v2-sm">
                                  <Input
                                    value={field.state.value}
                                    onChange={(e) => {
                                      field.handleChange(e.target.value);
                                      domainsFilterField.validate('change');
                                    }}
                                    placeholder={t(
                                      'settings:ai_assist.case_manager.domains_filter.placeholder',
                                    )}
                                    disabled={!isEnabled}
                                  />
                                  <ButtonV2
                                    mode="icon"
                                    variant="secondary"
                                    onClick={() => domainsFilterField.removeValue(idx)}
                                    disabled={!isEnabled}
                                  >
                                    <Icon
                                      icon="delete"
                                      className={'size-3.5 shrink-0 cursor-pointer'}
                                      aria-label={t(
                                        'settings:ai_assist.case_manager.domains_filter.delete',
                                      )}
                                    />
                                  </ButtonV2>
                                  <FormError
                                    field={field}
                                    asString
                                    translations={{
                                      invalid_union: t(
                                        'settings:ai_assist.case_manager.kyc_enrichment.domains_filter.add_new.error',
                                      ),
                                    }}
                                  />
                                </div>
                              )}
                            </form.Field>
                          ))}
                          <div className="flex gap-v2-md items-center col-span-full">
                            <ButtonV2
                              disabled={!isEnabled || domainsFilterField.state.value.length >= 10}
                              className="w-fit"
                              onClick={() => domainsFilterField.pushValue('')}
                            >
                              <Icon icon="plus" className="size-3.5 shrink-0 cursor-pointer" />
                              {t('settings:ai_assist.case_manager.kyc_enrichment.add_new.button')}
                            </ButtonV2>
                          </div>
                          <FormError field={domainsFilterField} className="col-span-full" />
                        </>
                      )}
                    </form.Subscribe>
                  )}
                </form.Field>
              </div>
            </CollapsiblePaper.Content>
          </CollapsiblePaper.Container>
          <div className="flex justify-end">
            <form.Subscribe
              selector={(state) => ({ isDirty: state.isDirty, isSubmitting: state.isSubmitting })}
            >
              {({ isDirty, isSubmitting }) => (
                <ButtonV2
                  type="submit"
                  variant="primary"
                  form="ai-settings-form"
                  disabled={!isDirty || isSubmitting || updateAiSettingsMutation.isPending}
                >
                  {t('common:save')}
                </ButtonV2>
              )}
            </form.Subscribe>
          </div>
        </form>
      </Page.Content>
    </Page.Container>
  );
}
