import { Callout } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { scenarioObjectDocHref } from '@app-builder/services/documentation-href';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import * as Ariakit from '@ariakit/react';
import { type ActionFunctionArgs, json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHydrated } from 'remix-utils/use-hydrated';
import { Button, ModalV2, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['scenarios', 'navigation', 'common'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  return { dataModel: await dataModelRepository.getDataModel() };
}

const createScenarioFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  triggerObjectType: z.string().min(1),
});

type CreateScenarioForm = z.infer<typeof createScenarioFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, rawData, { scenario }] = await Promise.all([
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = createScenarioFormSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    const createdScenario = await scenario.createScenario(data);
    const scenarioIteration = await scenario.createScenarioIteration({
      scenarioId: createdScenario.id,
    });

    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId', {
        scenarioId: fromUUIDtoSUUID(createdScenario.id),
        iterationId: fromUUIDtoSUUID(scenarioIteration.id),
      }),
    );
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export function CreateScenario({ children }: { children: React.ReactElement }) {
  const hydrated = useHydrated();
  return (
    <ModalV2.Root>
      <ModalV2.Trigger render={children} disabled={!hydrated} />
      <ModalV2.Content>
        <CreateScenarioContent />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

function CreateScenarioContent() {
  const { t, i18n } = useTranslation(handle.i18n);
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

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      triggerObjectType: '',
    } satisfies CreateScenarioForm,
    onSubmit: ({ value }) => {
      createScenarioFetcher.submit(value, {
        method: 'PATCH',
        action: getRoute('/ressources/scenarios/create'),
        encType: 'application/json',
      });
    },
    validators: {
      onSubmit: createScenarioFormSchema,
    },
  });

  return (
    <form onSubmit={handleSubmit(form)}>
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
          <form.Field
            name="name"
            validators={{
              onBlur: createScenarioFormSchema.shape.name,
              onChange: createScenarioFormSchema.shape.name,
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
              onBlur: createScenarioFormSchema.shape.triggerObjectType,
              onChange: createScenarioFormSchema.shape.triggerObjectType,
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
                      className="bg-grey-100 border-grey-90 flex w-fit max-w-80 rounded border p-2 shadow-md"
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
                  {dataModelFetcher.state === 'loading' ? <p>{t('common:loading')}</p> : null}
                  {dataModel.map((tableName) => {
                    return (
                      <Select.DefaultItem key={tableName} value={tableName}>
                        {tableName}
                      </Select.DefaultItem>
                    );
                  })}
                  {dataModelFetcher.state === 'idle' && dataModel.length === 0 ? (
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
