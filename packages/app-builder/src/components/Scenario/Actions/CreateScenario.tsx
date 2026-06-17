import { Callout } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { Spinner } from '@app-builder/components/Spinner';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { DataModel } from '@app-builder/models';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import {
  CreateScenarioPayload,
  createScenarioPayloadSchema,
  useCreateScenarioMutation,
} from '@app-builder/queries/scenarios/create-scenario';
import { scenarioObjectDocHref } from '@app-builder/services/documentation-href';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import * as Ariakit from '@ariakit/react';
import { useForm } from '@tanstack/react-form';
import { useHydrated } from '@tanstack/react-router';
import * as React from 'react';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Modal, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateScenario({ children }: { children: React.ReactElement }) {
  const hydrated = useHydrated();
  const dataModelQuery = useDataModelQuery();
  const [open, setOpen] = React.useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild disabled={hydrated && !dataModelQuery.isSuccess}>
        {children}
      </Modal.Trigger>
      <Modal.Content>
        {dataModelQuery.isSuccess ? (
          <CreateScenarioContent dataModel={dataModelQuery.data.dataModel} onCreateSuccess={() => setOpen(false)} />
        ) : null}
      </Modal.Content>
    </Modal.Root>
  );
}

function CreateScenarioContent({ dataModel, onCreateSuccess }: { dataModel: DataModel; onCreateSuccess: () => void }) {
  const { t, i18n } = useTranslation(['common', 'scenarios']);
  const createScenarioMutation = useCreateScenarioMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      triggerObjectType: '',
    } satisfies CreateScenarioPayload,
    onSubmit: ({ value }) => {
      createScenarioMutation
        .mutateAsync(value)
        .then(() => {
          onCreateSuccess();
          revalidate();
        })
        .catch(() => {
          toast.error(t('common:errors.unknown'));
        });
    },
    validators: {
      onSubmit: createScenarioPayloadSchema,
    },
  });

  const isSubmitting = createScenarioMutation.isPending || form.state.isSubmitting;

  return (
    <form onSubmit={handleSubmit(form)}>
      <Modal.Title>{t('scenarios:create_scenario.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <Modal.Description asChild>
          <Callout variant="outlined">
            <p className="whitespace-pre-wrap">
              <Trans
                t={t}
                i18nKey="scenarios:create_scenario.callout"
                components={{
                  DocLink: <ExternalLink href={scenarioObjectDocHref} />,
                }}
              />
            </p>
          </Callout>
        </Modal.Description>
        <div className="flex flex-1 flex-col gap-4">
          <form.Field
            name="name"
            validators={{
              onChange: createScenarioPayloadSchema.shape.name,
            }}
          >
            {(field) => (
              <div className="group flex w-full flex-col gap-2">
                <FormLabel name={field.name}>{t('scenarios:create_scenario.name')}</FormLabel>
                <FormInput
                  type="text"
                  name={field.name}
                  defaultValue={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  valid={field.state.meta.errors.length === 0}
                  placeholder={t('scenarios:create_scenario.name_placeholder')}
                />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <div className="group flex w-full flex-col gap-2">
                <FormLabel name={field.name}>{t('scenarios:create_scenario.description')}</FormLabel>
                <FormInput
                  type="text"
                  name={field.name}
                  defaultValue={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  valid={field.state.meta.errors.length === 0}
                  placeholder={t('scenarios:create_scenario.description_placeholder')}
                />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
          <form.Field
            name="triggerObjectType"
            validators={{
              onChange: createScenarioPayloadSchema.shape.triggerObjectType,
            }}
          >
            {(field) => (
              <div className="group flex w-full flex-col gap-2">
                <FormLabel name={field.name} className="flex flex-row items-center gap-1">
                  {t('scenarios:create_scenario.trigger_object_title')}
                  <Ariakit.HovercardProvider
                    showTimeout={0}
                    hideTimeout={0}
                    placement={i18n.dir() === 'ltr' ? 'right' : 'left'}
                  >
                    <Ariakit.HovercardAnchor
                      tabIndex={-1}
                      className="text-grey-disabled hover:text-grey-secondary cursor-pointer transition-colors"
                    >
                      <Icon icon="tip" className="size-5" />
                    </Ariakit.HovercardAnchor>
                    <Ariakit.Hovercard
                      portal
                      gutter={4}
                      className="bg-surface-card border-grey-border flex w-fit max-w-80 rounded-sm border p-2 shadow-md"
                    >
                      {t('scenarios:trigger_object.description')}
                    </Ariakit.Hovercard>
                  </Ariakit.HovercardProvider>
                </FormLabel>
                <SelectV2
                  placeholder={t('scenarios:create_scenario.trigger_object_placeholder')}
                  value={field.state.value}
                  onChange={(value) => {
                    field.handleChange(value);
                    field.handleBlur();
                  }}
                  options={dataModel.map((tableName) => ({
                    label: tableName.name,
                    value: tableName.name,
                  }))}
                />
                {dataModel.length === 0 ? <p>{t('scenarios:create_scenario.no_trigger_object')}</p> : null}
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
        </div>
      </div>
      <Modal.Footer>
        <Modal.Close asChild>
          <Button type="button" variant="secondary" appearance="stroked" size="large">
            {t('common:cancel')}
          </Button>
        </Modal.Close>
        <Button variant="primary" type="submit" disabled={isSubmitting} size="large">
          {isSubmitting ? <Spinner className="size-4" /> : null}
          {t('common:save')}
        </Button>
      </Modal.Footer>
    </form>
  );
}
