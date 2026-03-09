import { CollapsiblePaper, Page } from '@app-builder/components';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { FormTextArea } from '@app-builder/components/Form/Tanstack/FormTextArea';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { useUpdateAiSettings } from '@app-builder/queries/cases/update-ai-settings';
import { handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/node';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

export const loader = createServerFn([authMiddleware], async function aiCaseReviewLoader({ context }) {
  const { user, aiAssistSettings } = context.authInfo;

  if (!isAdmin(user)) {
    return redirect(getRoute('/'));
  }

  const settings = await aiAssistSettings.getAiAssistSettings();
  return { settings };
});

export default function AiCaseReview() {
  const { t } = useTranslation(['settings', 'common']);
  const { settings } = useLoaderData<typeof loader>();
  const updateMutation = useUpdateAiSettings();
  const revalidator = useRevalidator();

  const form = useForm({
    defaultValues: {
      caseReviewSetting: {
        language: settings.caseReviewSetting.language,
        structure: settings.caseReviewSetting.structure,
        orgDescription: settings.caseReviewSetting.orgDescription,
        additionalCaseReviewInstruction: settings.caseReviewSetting.additionalCaseReviewInstruction,
      },
      kycEnrichmentSetting: {
        enabled: settings.kycEnrichmentSetting.enabled,
        customInstructions: settings.kycEnrichmentSetting.customInstructions,
        domainsFilter: settings.kycEnrichmentSetting.domainsFilter,
      },
    },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync(value);
      revalidator.revalidate();
    },
  });

  return (
    <Page.Container>
      <Page.Content className="max-w-(--breakpoint-xl)">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit(form)}>
          <div className="flex items-center justify-end">
            <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Icon icon="spinner" className="size-5 animate-spin" /> : null}
              {t('common:save')}
            </Button>
          </div>
          <CollapsiblePaper.Container>
            <CollapsiblePaper.Title>
              <span className="flex-1">{t('settings:ai_case_review_instruction.title')}</span>
            </CollapsiblePaper.Title>
            <CollapsiblePaper.Content>
              <form.Field name="caseReviewSetting.additionalCaseReviewInstruction">
                {(field) => (
                  <div className="flex flex-col gap-v2-xs">
                    <FormLabel name={field.name} className="text-xs flex items-center gap-2">
                      {t('settings:ai_case_review_instruction.label')}
                      <Tooltip.Default
                        delayDuration={300}
                        className="max-w-96"
                        content={
                          <span className="font-normal text-pretty">
                            {t('settings:ai_case_review_instruction.tooltip')}
                          </span>
                        }
                      >
                        <Icon icon="tip" className="size-4 shrink-0 cursor-pointer text-purple-primary" />
                      </Tooltip.Default>
                    </FormLabel>
                    <FormTextArea
                      name={field.name}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      defaultValue={field.state.value}
                      valid={field.state.meta.errors.length === 0}
                      resize="vertical"
                      className="min-h-[200px]"
                      placeholder={t('settings:ai_case_review_instruction.placeholder')}
                    />
                  </div>
                )}
              </form.Field>
            </CollapsiblePaper.Content>
          </CollapsiblePaper.Container>
        </form>
      </Page.Content>
    </Page.Container>
  );
}
