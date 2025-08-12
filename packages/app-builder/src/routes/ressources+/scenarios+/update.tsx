import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { redirectBack } from 'remix-utils/redirect-back';
import { useHydrated } from 'remix-utils/use-hydrated';
import { Button, ModalV2 } from 'ui-design-system';
import { z } from 'zod/v4';

const updateScenarioFormSchema = z.object({
  scenarioId: z.uuid(),
  name: z.string().min(1),
  description: z.string(),
});

type UpdateScenarioForm = z.infer<typeof updateScenarioFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, rawData, { scenario }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = updateScenarioFormSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: z.treeifyError(error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await scenario.updateScenario(data);

    return redirectBack(request, {
      fallback: getRoute('/scenarios/:scenarioId', {
        scenarioId: fromUUIDtoSUUID(data.scenarioId),
      }),
    });
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export function UpdateScenario({
  children,
  defaultValue,
}: {
  children: React.ReactElement;
  defaultValue: UpdateScenarioForm;
}) {
  const [open, setOpen] = React.useState(false);
  const hydrated = useHydrated();

  const navigation = useNavigation();
  React.useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger render={children} disabled={!hydrated} />
      <ModalV2.Content>
        <UpdateScenarioContent defaultValue={defaultValue} />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

function UpdateScenarioContent({ defaultValue }: { defaultValue: UpdateScenarioForm }) {
  const { t } = useTranslation(['scenarios', 'common']);
  const fetcher = useFetcher<typeof action>();

  const form = useForm({
    defaultValues: defaultValue,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'PATCH',
          action: getRoute('/ressources/scenarios/update'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onSubmitAsync: updateScenarioFormSchema,
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <ModalV2.Title>{t('scenarios:update_scenario.title')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <form.Field
          name="name"
          validators={{
            onBlur: updateScenarioFormSchema.shape.name,
            onChange: updateScenarioFormSchema.shape.name,
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
        <form.Field
          name="description"
          validators={{
            onBlur: updateScenarioFormSchema.shape.description,
            onChange: updateScenarioFormSchema.shape.description,
          }}
        >
          {(field) => (
            <div className="group flex w-full flex-col gap-2">
              <FormLabel name={field.name}>{t('scenarios:create_scenario.description')}</FormLabel>
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
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close render={<Button className="flex-1" variant="secondary" />}>
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
