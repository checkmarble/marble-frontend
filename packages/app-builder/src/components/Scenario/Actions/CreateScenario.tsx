import { Callout } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
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
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, ModalV2, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateScenario({ children }: { children: React.ReactElement }) {
  const dataModelQuery = useDataModelQuery();

  return (
    <ModalV2.Root>
      <ModalV2.Trigger render={children} disabled={!dataModelQuery.isSuccess} />
      <ModalV2.Content>
        {dataModelQuery.isSuccess ? (
          <CreateScenarioContent dataModel={dataModelQuery.data.dataModel} />
        ) : null}
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

function CreateScenarioContent({ dataModel }: { dataModel: DataModel }) {
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
      createScenarioMutation.mutateAsync(value).then(() => {
        revalidate();
      });
    },
    validators: {
      onSubmit: createScenarioPayloadSchema,
    },
  });

  return (
    <form onSubmit={handleSubmit(form)}>
      <ModalV2.Title>{t('scenarios:create_scenario.title')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <ModalV2.Description render={<Callout variant="outlined" />}>
          <p className="whitespace-pre-wrap">
            <Trans
              t={t}
              i18nKey="scenarios:create_scenario.callout"
              components={{
                DocLink: <ExternalLink href={scenarioObjectDocHref} />,
              }}
            />
          </p>
        </ModalV2.Description>
        <div className="flex flex-1 flex-col gap-4">
          <form.Field
            name="name"
            validators={{
              onBlur: createScenarioPayloadSchema.shape.name,
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
                  onBlur={field.handleBlur}
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
                <FormLabel name={field.name}>
                  {t('scenarios:create_scenario.description')}
                </FormLabel>
                <FormInput
                  type="text"
                  name={field.name}
                  defaultValue={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  onBlur={field.handleBlur}
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
              onBlur: createScenarioPayloadSchema.shape.triggerObjectType,
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
                      className="text-grey-80 hover:text-grey-50 cursor-pointer transition-colors"
                    >
                      <Icon icon="tip" className="size-5" />
                    </Ariakit.HovercardAnchor>
                    <Ariakit.Hovercard
                      portal
                      gutter={4}
                      className="bg-grey-100 border-grey-90 flex w-fit max-w-80 rounded-sm border p-2 shadow-md"
                    >
                      {t('scenarios:trigger_object.description')}
                    </Ariakit.Hovercard>
                  </Ariakit.HovercardProvider>
                </FormLabel>
                <Select.Default
                  placeholder={t('scenarios:create_scenario.trigger_object_placeholder')}
                  defaultValue={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value);
                    field.handleBlur();
                  }}
                >
                  {dataModel.map((tableName) => {
                    return (
                      <Select.DefaultItem key={tableName.name} value={tableName.name}>
                        {tableName.name}
                      </Select.DefaultItem>
                    );
                  })}
                  {dataModel.length === 0 ? (
                    <p>{t('scenarios:create_scenario.no_trigger_object')}</p>
                  ) : null}
                </Select.Default>
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close render={<Button className="flex-1" type="button" variant="secondary" />}>
            {t('common:cancel')}
          </ModalV2.Close>
          <Button className="flex-1" variant="primary" type="submit">
            {t('common:save')}
          </Button>
        </div>
      </div>
    </form>
  );
}
