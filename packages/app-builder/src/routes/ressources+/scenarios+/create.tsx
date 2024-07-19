import { Callout } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormError } from '@app-builder/components/Form/FormError';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { scenarioObjectDocHref } from '@app-builder/services/documentation-href';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { FormProvider, getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  redirect,
} from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, ModalV2 } from 'ui-design-system';
import { z } from 'zod';

export const handle = {
  i18n: ['scenarios', 'navigation', 'common'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const dataModel = await dataModelRepository.getDataModel();

  return json({
    dataModel,
  });
}

const createScenarioFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().default(null),
  triggerObjectType: z.string().min(1),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: createScenarioFormSchema,
  });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    const createdScenario = await scenario.createScenario(submission.value);
    const scenarioIteration = await scenario.createScenarioIteration({
      scenarioId: createdScenario.id,
    });
    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId', {
        scenarioId: fromUUID(createdScenario.id),
        iterationId: fromUUID(scenarioIteration.id),
      }),
    );
  } catch (error) {
    return json(submission.reply());
  }
}

export function CreateScenario({ children }: { children: React.ReactElement }) {
  return (
    <ModalV2.Root>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content>
        <CreateScenarioContent />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

function CreateScenarioContent() {
  const { t } = useTranslation(handle.i18n);
  const dataModelFetcher = useFetcher<typeof loader>();

  const { load: loadDataModel } = dataModelFetcher;
  React.useEffect(() => {
    loadDataModel(getRoute('/ressources/scenarios/create'));
  }, [loadDataModel]);

  const dataModel = React.useMemo(
    () => dataModelFetcher.data?.dataModel.map(({ name }) => name) ?? [],
    [dataModelFetcher.data],
  );

  const createScenarioFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    lastResult: createScenarioFetcher.data,
    constraint: getZodConstraint(createScenarioFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: createScenarioFormSchema,
      });
    },
  });

  return (
    <FormProvider context={form.context}>
      <createScenarioFetcher.Form
        method="POST"
        action={getRoute('/ressources/scenarios/create')}
        {...getFormProps(form)}
      >
        <ModalV2.Title>{t('scenarios:create_scenario.title')}</ModalV2.Title>
        <div className="flex flex-col gap-6 p-6">
          <ModalV2.Description render={<Callout variant="outlined" />}>
            <p className="whitespace-pre text-wrap">
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
            <FormField
              name={fields.name.name}
              className="group flex w-full flex-col gap-2"
            >
              <FormLabel>{t('scenarios:create_scenario.name')}</FormLabel>
              <FormInput
                type="text"
                placeholder={t('scenarios:create_scenario.name_placeholder')}
              />
              <FormError />
            </FormField>
            <FormField
              name={fields.description.name}
              className="group flex w-full flex-col gap-2"
            >
              <FormLabel>
                {t('scenarios:create_scenario.description')}
              </FormLabel>
              <FormInput
                type="text"
                placeholder={t(
                  'scenarios:create_scenario.description_placeholder',
                )}
              />
              <FormError />
            </FormField>
            <FormField
              name={fields.triggerObjectType.name}
              className="group flex w-full flex-col gap-2"
            >
              <FormLabel>
                {t('scenarios:create_scenario.trigger_object_title')}
              </FormLabel>
              <FormSelect.Default
                placeholder={t(
                  'scenarios:create_scenario.trigger_object_placeholder',
                )}
                options={dataModel}
              >
                {dataModelFetcher.state === 'loading' ? (
                  <p>{t('common:loading')}</p>
                ) : null}
                {dataModel.map((tableName) => {
                  return (
                    <FormSelect.DefaultItem key={tableName} value={tableName}>
                      {tableName}
                    </FormSelect.DefaultItem>
                  );
                })}
                {dataModelFetcher.state === 'idle' && dataModel.length === 0 ? (
                  <p>{t('scenarios:create_scenario.no_trigger_object')}</p>
                ) : null}
              </FormSelect.Default>
              <FormError />
            </FormField>
          </div>
          <div className="flex flex-1 flex-row gap-2">
            <ModalV2.Close
              render={<Button className="flex-1" variant="secondary" />}
            >
              {t('common:cancel')}
            </ModalV2.Close>
            <Button className="flex-1" variant="primary" type="submit">
              {t('common:save')}
            </Button>
          </div>
        </div>
      </createScenarioFetcher.Form>
    </FormProvider>
  );
}
