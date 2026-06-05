import { Callout } from '@app-builder/components/Callout';
import { Page } from '@app-builder/components/Page';
import { CollapsiblePaper } from '@app-builder/components/Paper';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type Organization, type ScreeningProvider } from '@app-builder/models/organization';
import {
  updateScreeningProvidersPayloadSchema,
  useUpdateScreeningProviders,
} from '@app-builder/queries/settings/organization/update-screening-providers';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, type SelectOption, SelectV2 } from 'ui-design-system';

const SCREENING_FEATURES = [
  { name: 'manualSearch', labelKey: 'settings:screening_providers.manual_search' },
  { name: 'transactionMonitoring', labelKey: 'settings:screening_providers.transaction_monitoring' },
  { name: 'continuousMonitoring', labelKey: 'settings:screening_providers.continuous_screening' },
] as const;

export const ScreeningProvidersSettingsPage = ({
  providers,
  organizationId,
  availableProviders,
}: {
  providers: Organization['screeningProviders'];
  organizationId: string;
  availableProviders: ScreeningProvider[];
}) => {
  const { t } = useTranslation(['common', 'settings']);
  const updateScreeningProvidersMutation = useUpdateScreeningProviders(organizationId);
  const revalidate = useLoaderRevalidator();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const providerLabels: Record<ScreeningProvider, string> = {
    opensanctions: t('settings:screening_providers.provider.opensanctions'),
    lexisnexis: t('settings:screening_providers.provider.lexisnexis'),
  };
  const providerOptions: SelectOption<ScreeningProvider>[] = availableProviders.map((provider) => ({
    value: provider,
    label: providerLabels[provider],
  }));

  const form = useForm({
    defaultValues: {
      manualSearch: providers?.manualSearch ?? 'opensanctions',
      transactionMonitoring: providers?.transactionMonitoring ?? 'opensanctions',
      continuousMonitoring: providers?.continuousMonitoring ?? 'opensanctions',
    } satisfies Record<string, ScreeningProvider>,
    onSubmit: ({ value }) => {
      setSubmitError(null);
      updateScreeningProvidersMutation
        .mutateAsync(value)
        .then((res) => {
          if (res && 'error' in res) {
            setSubmitError(res.error);
            return;
          }

          toast.success(t('common:success.save'));
          revalidate();
        })
        .catch((error) => {
          const message = error instanceof Error ? error.message : t('common:errors.unknown');
          setSubmitError(message);
          toast.error(message);
        });
    },
    validators: {
      onSubmit: updateScreeningProvidersPayloadSchema.omit({ organizationId: true }),
    },
  });

  return (
    <Page.Container>
      <Page.Content className="max-w-(--breakpoint-xl)">
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:screening_providers')}</span>
            <Button
              variant="secondary"
              appearance="stroked"
              onClick={(e) => {
                e.stopPropagation();
                setSubmitError(null);
                form.reset();
              }}
            >
              {t('settings:screening_providers.reset')}
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="screening-providers-form"
              onClick={(e) => e.stopPropagation()}
            >
              {t('settings:screening_providers.save')}
            </Button>
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <Callout color="red" icon="error" iconColor="red" className="mb-v2-md">
              {submitError}
            </Callout>
            <form
              onSubmit={handleSubmit(form)}
              className="grid grid-cols-[300px_1fr] gap-v2-sm items-center"
              id="screening-providers-form"
            >
              {SCREENING_FEATURES.map((feature) => (
                <form.Field key={feature.name} name={feature.name}>
                  {(field) => (
                    <>
                      <span className="text-s text-grey-primary">{t(feature.labelKey)}</span>
                      <SelectV2
                        value={field.state.value}
                        onChange={field.handleChange}
                        options={providerOptions}
                        placeholder={t('settings:screening_providers.provider.opensanctions')}
                        className="w-fit"
                      />
                    </>
                  )}
                </form.Field>
              ))}
            </form>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
      </Page.Content>
    </Page.Container>
  );
};
