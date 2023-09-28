import { type TableModel } from '@app-builder/models/data-model';
import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { type ActionArgs, json, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { Button, HiddenInputs, Input, Modal, Select } from '@ui-design-system';
import { Plus } from '@ui-icons';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const handle = {
  i18n: ['scenarios', 'navigation', 'common'] satisfies Namespace,
};

const createScenarioFormSchema = z.object({
  name: z.string().nonempty(),
  description: z.string(),
  triggerObjectType: z.string().nonempty(),
});

export async function action({ request }: ActionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
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
    const scenario = await apiClient.createScenario({
      name: name,
      description: description,
      triggerObjectType: triggerObjectType,
    });
    const scenarioIteration = await apiClient.createScenarioIteration({
      scenarioId: scenario.id,
    });
    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId', {
        scenarioId: fromUUID(scenario.id),
        iterationId: fromUUID(scenarioIteration.id),
      })
    );
  } catch (error) {
    return json({
      success: false as const,
      values: parsedForm.data,
      error: error,
    });
  }
}

export function CreateScenario({ dataModel }: { dataModel: TableModel[] }) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();
  const [triggerObjectType, setSelectedTriggerObjectType] = useState('');

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button>
          <Plus width={'24px'} height={'24px'} />
          {t('scenarios:create_scenario.title')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <fetcher.Form method="POST" action="/ressources/scenarios/create">
          <Modal.Title>{t('scenarios:create_scenario.title')}</Modal.Title>
          <div className="bg-grey-00 flex flex-col gap-8 p-8">
            <div className="flex flex-1 flex-col gap-4">
              <label htmlFor="name">
                {t('scenarios:create_scenario.name')}
              </label>
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
                placeholder={t(
                  'scenarios:create_scenario.description_placeholder'
                )}
              />
              <label>
                {t('scenarios:create_scenario.trigger_object_title')}
              </label>
              <Select.Default
                placeholder={t(
                  'scenarios:create_scenario.trigger_object_placeholder'
                )}
                onValueChange={(dataModelName) => {
                  setSelectedTriggerObjectType(dataModelName);
                }}
              >
                {dataModel.map((dataModel) => {
                  return (
                    <Select.DefaultItem
                      key={dataModel.name}
                      value={dataModel.name}
                    >
                      {dataModel.name}
                    </Select.DefaultItem>
                  );
                })}
              </Select.Default>
              <HiddenInputs triggerObjectType={triggerObjectType} />
            </div>
            <div className="flex flex-1 flex-row gap-2">
              <Modal.Close asChild>
                <Button className="flex-1" variant="secondary">
                  {t('common:cancel')}
                </Button>
              </Modal.Close>
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
        </fetcher.Form>
      </Modal.Content>
    </Modal.Root>
  );
}
