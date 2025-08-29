import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { FormTextArea } from '@app-builder/components/Form/Tanstack/FormTextArea';

import { Page } from '@app-builder/components/Page';
import { CollapsiblePaper } from '@app-builder/components/Paper';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand } from 'ui-design-system';

import { z } from 'zod/v4';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { user } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  return { user };
}

/* Mock data */
// Supported languages list. use BCP47 format.
const supportedLanguages = ['en', 'fr', 'ar'];

// Structure : The desired output structure of the IA report. Free text defined by the user. (e.g. "The report should be in the following format: <name>, <age>, <gender>, <address>, <phone number>, <email>, <nationality>, <occupation>, <income>, <assets>, <liabilities>, <net worth>, <source of income>, <source of assets>, <source of liabilities>, <source of net worth>")
// Org description : The description of the organization.

// Supported LLM models list.
const supportedLLMModels = ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet-20240620'];

// Domain filter for KYC enrichment : Free array of string domains.

// Search context size (PerplexitySearchContextSize)
const supportedSearchContextSizes = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

const editIACaseReviewSchema = z.object({
  language: z.enum(supportedLanguages),
  structure: z.string(),
  orgDescription: z.string(),
  llmModel: z.enum(supportedLLMModels),
  domainFilter: z.array(z.string()),
  searchContextSize: z.enum(supportedSearchContextSizes.map(String)),
});

export default function IACaseReviewSettings() {
  const { t } = useTranslation(['settings']);
  const { user } = useLoaderData<typeof loader>();
  const form = useForm({
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        //TODO: Create a query mutation to update the IA case review settings.
        // Mock for now
        console.log('value', value);
        // setToastMessage(session, {
        //   type: 'success',
        //   messageKey: 'common:success.save',
        // });
      }
    },
    validators: {
      onSubmit: editIACaseReviewSchema as unknown as any,
    },
    defaultValues: {
      language: 'en',
      structure: '',
      orgDescription: '',
      llmModel: 'gpt-4o',
      domainFilter: [],
      searchContextSize: 100,
    },
  });
  console.log('user', user);
  return (
    <Page.Container>
      <Page.Content className="max-w-(--breakpoint-xl)">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="flex flex-col gap-4">
            <CollapsiblePaper.Container>
              <CollapsiblePaper.Title>
                <span className="flex-1">{t('settings:ia_case_review')}</span>
              </CollapsiblePaper.Title>
              <CollapsiblePaper.Content>
                <div className="flex flex-col gap-8">
                  {/* TODO: Add Org description */}
                  <form.Field name="orgDescription">
                    {(field) => (
                      <div className="group flex w-full flex-col gap-2">
                        <FormLabel name={field.name}>
                          {t('settings:ia_case_review.org_description')}
                        </FormLabel>
                        <FormTextArea
                          name={field.name}
                          onChange={(e) => field.handleChange(e.currentTarget.value)}
                          onBlur={field.handleBlur}
                          defaultValue={field.state.value}
                          valid={field.state.meta.errors.length === 0}
                        />
                      </div>
                    )}
                  </form.Field>

                  {/* TODO: Add Language */}
                  <form.Field name="language">
                    {(field) => (
                      <div className="group flex w-full flex-col gap-2">
                        <FormLabel name={field.name}>
                          {t('settings:ia_case_review.language')}
                        </FormLabel>
                        <MenuCommand.Menu>
                          <MenuCommand.Trigger>
                            <MenuCommand.SelectButton>{field.state.value}</MenuCommand.SelectButton>
                          </MenuCommand.Trigger>

                          <MenuCommand.Content
                            sameWidth
                            sideOffset={4}
                            align="start"
                            className="min-w-24"
                          >
                            <MenuCommand.List>
                              {supportedLanguages.map((language) => (
                                <MenuCommand.Item
                                  key={language}
                                  value={language}
                                  onSelect={() => field.handleChange(language)}
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
                  {/* TODO: Add Structure */}
                  <form.Field name="structure">
                    {(field) => (
                      <div className="group flex w-full flex-col gap-2">
                        <FormLabel name={field.name}>
                          {t('settings:ia_case_review.structure')}
                        </FormLabel>
                        <FormTextArea
                          name={field.name}
                          onChange={(e) => field.handleChange(e.currentTarget.value)}
                          onBlur={field.handleBlur}
                          defaultValue={field.state.value}
                          valid={field.state.meta.errors.length === 0}
                        />
                      </div>
                    )}
                  </form.Field>
                </div>
              </CollapsiblePaper.Content>
            </CollapsiblePaper.Container>
            {/* TODO: Add LLM Model */}
            <CollapsiblePaper.Container>
              <CollapsiblePaper.Title>
                <span className="flex-1">{t('settings:ia_llm_config')}</span>
              </CollapsiblePaper.Title>
              <CollapsiblePaper.Content>
                <div className="flex flex-col gap-8">
                  {/* TODO: Add LLM Model */}
                  <form.Field name="llmModel">
                    {(field) => (
                      <div className="group flex w-full flex-col gap-2">
                        <FormLabel name={field.name}>
                          {t('settings:ia_llm_config.llm_model')}
                        </FormLabel>
                        <MenuCommand.Menu>
                          <MenuCommand.Trigger>
                            <MenuCommand.SelectButton>{field.state.value}</MenuCommand.SelectButton>
                          </MenuCommand.Trigger>
                          <MenuCommand.Content
                            sameWidth
                            sideOffset={4}
                            align="start"
                            className="min-w-24"
                          >
                            <MenuCommand.List>
                              {supportedLLMModels.map((model) => (
                                <MenuCommand.Item
                                  key={model}
                                  value={model}
                                  onSelect={() => field.handleChange(model)}
                                >
                                  {model}
                                </MenuCommand.Item>
                              ))}
                            </MenuCommand.List>
                          </MenuCommand.Content>
                        </MenuCommand.Menu>
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* TODO: Add Search Context Size */}

                <form.Field name="searchContextSize">
                  {(field) => (
                    <div className="group flex w-full flex-col gap-2">
                      <FormLabel name={field.name}>
                        {t('settings:ia_llm_config.search_context_size')}
                      </FormLabel>
                      <MenuCommand.Menu>
                        <MenuCommand.Trigger>
                          <MenuCommand.SelectButton>{field.state.value}</MenuCommand.SelectButton>
                        </MenuCommand.Trigger>

                        <MenuCommand.Content
                          sameWidth
                          sideOffset={4}
                          align="start"
                          className="min-w-24"
                        >
                          <MenuCommand.List>
                            {supportedSearchContextSizes.map((size) => (
                              <MenuCommand.Item
                                key={size}
                                value={size}
                                onSelect={() => field.handleChange(size)}
                              >
                                {size}
                              </MenuCommand.Item>
                            ))}
                          </MenuCommand.List>
                        </MenuCommand.Content>
                      </MenuCommand.Menu>
                    </div>
                  )}
                </form.Field>
              </CollapsiblePaper.Content>
            </CollapsiblePaper.Container>
            {/* TODO: Add Domain Filter */}
            {/* TODO: Add Domain Filter */}
          </div>
          <Button type="submit" variant="primary">
            {t('common:save')}
          </Button>
        </form>
      </Page.Content>
    </Page.Container>
  );
}
