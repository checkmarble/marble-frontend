import { Callout } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { scenarioObjectDocHref } from '@app-builder/services/documentation-href';
import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  redirect,
} from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, HiddenInputs, Input, ModalV2, Select } from 'ui-design-system';
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
  description: z.string(),
  triggerObjectType: z.string().min(1),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const parsedForm = await parseFormSafe(request, createScenarioFormSchema);
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: parsedForm.formData,
      error: parsedForm.error.format(),
    });
  }
  const { name, description, triggerObjectType } = parsedForm.data;

  try {
    const createdScenario = await scenario.createScenario({
      name: name,
      description: description,
      triggerObjectType: triggerObjectType,
    });
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
    return json({
      success: false as const,
      values: parsedForm.data,
      error: error,
    });
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
  const createScenarioFetcher = useFetcher<typeof action>();
  const [triggerObjectType, setSelectedTriggerObjectType] = useState('');

  const { load: loadDataModel } = dataModelFetcher;
  useEffect(() => {
    loadDataModel(getRoute('/ressources/scenarios/create'));
  }, [loadDataModel]);

  const dataModel = dataModelFetcher.data?.dataModel ?? [];

  return (
    <createScenarioFetcher.Form
      method="POST"
      action={getRoute('/ressources/scenarios/create')}
    >
      <ModalV2.Title>{t('scenarios:create_scenario.title')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <ModalV2.Description>
          <Callout variant="outlined">
            <p className="whitespace-pre text-wrap">
              <Trans
                t={t}
                i18nKey="scenarios:create_scenario.callout"
                components={{
                  DocLink: <ExternalLink href={scenarioObjectDocHref} />,
                }}
              />
            </p>
          </Callout>
        </ModalV2.Description>
        <div className="flex flex-1 flex-col gap-4">
          <label htmlFor="name">{t('scenarios:create_scenario.name')}</label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder={t('scenarios:create_scenario.name_placeholder')}
          />
          <label htmlFor="description">
            {t('scenarios:create_scenario.description')}
          </label>
          <Input
            id="description"
            name="description"
            type="text"
            placeholder={t('scenarios:create_scenario.description_placeholder')}
          />
          <label>{t('scenarios:create_scenario.trigger_object_title')}</label>
          <Select.Default
            placeholder={t(
              'scenarios:create_scenario.trigger_object_placeholder',
            )}
            onValueChange={(dataModelName) => {
              setSelectedTriggerObjectType(dataModelName);
            }}
          >
            {dataModelFetcher.state === 'loading' ? (
              <p>{t('common:loading')}</p>
            ) : null}
            {dataModel.map((dataModel) => {
              return (
                <Select.DefaultItem key={dataModel.name} value={dataModel.name}>
                  {dataModel.name}
                </Select.DefaultItem>
              );
            })}
            {dataModelFetcher.state === 'idle' && dataModel.length === 0 ? (
              <p>{t('scenarios:create_scenario.no_trigger_object')}</p>
            ) : null}
          </Select.Default>
          <HiddenInputs triggerObjectType={triggerObjectType} />
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close
            render={<Button className="flex-1" variant="secondary" />}
          >
            {t('common:cancel')}
          </ModalV2.Close>
          <Button
            className="flex-1"
            variant="primary"
            type="submit"
            name="create"
          >
            {t('common:save')}
          </Button>
        </div>
      </div>
    </createScenarioFetcher.Form>
  );
}
