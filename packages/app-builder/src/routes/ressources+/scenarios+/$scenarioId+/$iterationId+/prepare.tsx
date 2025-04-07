import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { PreparationServiceOccupied } from '@app-builder/repositories/ScenarioRepository';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { redirectBack } from 'remix-utils/redirect-back';
import { Button, Checkbox, Modal, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const prepareFormSchema = z.object({
  activateToGoInProd: z.boolean().pipe(z.literal(true)),
  preparationIsAsync: z.boolean().pipe(z.literal(true)),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, rawData, { scenario }] = await Promise.all([
    getFixedT(request, ['common', 'scenarios']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  const { error, success } = prepareFormSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await scenario.startPublicationPreparation({
      iterationId,
    });

    return redirectBack(request, {
      fallback: getRoute('/scenarios/:scenarioId/i/:iterationId', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
        iterationId: fromUUIDtoSUUID(iterationId),
      }),
    });
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      message:
        error instanceof PreparationServiceOccupied
          ? t('scenarios:deployment_modal.prepare.preparation_service_occupied')
          : t('common:errors.unknown'),
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export function PrepareScenarioVersion({
  scenarioId,
  iteration,
  isPreparationServiceOccupied,
}: {
  scenarioId: string;
  iteration: {
    id: string;
    isValid: boolean;
  };
  isPreparationServiceOccupied: boolean;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const [open, setOpen] = React.useState(false);

  const navigation = useNavigation();
  React.useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  const button = (
    <Button className="flex-1" variant="primary" disabled={!iteration.isValid}>
      <Icon icon="queue-list" className="size-6" />
      {t('scenarios:deployment_modal.prepare.button')}
    </Button>
  );

  if (!iteration.isValid) {
    return (
      <Tooltip.Default
        className="text-xs"
        content={t('scenarios:deployment_modal.prepare.validation_error')}
      >
        {button}
      </Tooltip.Default>
    );
  }
  if (isPreparationServiceOccupied) {
    return (
      <Tooltip.Default
        className="text-xs"
        content={t('scenarios:deployment_modal.prepare.preparation_service_occupied')}
      >
        {button}
      </Tooltip.Default>
    );
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{button}</Modal.Trigger>
      <Modal.Content>
        <PrepareScenarioVersionContent scenarioId={scenarioId} iterationId={iteration.id} />
      </Modal.Content>
    </Modal.Root>
  );
}

//TODO: customise to Prepare
function PrepareScenarioVersionContent({
  scenarioId,
  iterationId,
}: {
  scenarioId: string;
  iterationId: string;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const fetcher = useFetcher<typeof action>();

  const form = useForm({
    defaultValues: {
      activateToGoInProd: false,
      preparationIsAsync: false,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/scenarios/:scenarioId/:iterationId/prepare', {
            scenarioId: fromUUIDtoSUUID(scenarioId),
            iterationId: fromUUIDtoSUUID(iterationId),
          }),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChangeAsync: prepareFormSchema,
      onBlurAsync: prepareFormSchema,
      onSubmitAsync: prepareFormSchema,
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
      <Modal.Title>{t('scenarios:deployment_modal.prepare.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex flex-col gap-4 font-medium">
          <p className="font-semibold">{t('scenarios:deployment_modal.prepare.confirm')}</p>
          <form.Field name="activateToGoInProd">
            {(field) => (
              <div className="group flex flex-row items-center gap-2">
                <Checkbox
                  name={field.name}
                  defaultChecked={field.state.value}
                  onCheckedChange={(state) =>
                    state !== 'indeterminate' && field.handleChange(state)
                  }
                />
                <FormLabel name={field.name}>
                  {t('scenarios:deployment_modal.prepare.activate_to_go_in_prod')}
                </FormLabel>
                <Tooltip.Default
                  content={
                    <p className="max-w-60">
                      {t('scenarios:deployment_modal.prepare.activate_to_go_in_prod.tooltip')}
                    </p>
                  }
                >
                  <Icon icon="tip" className="hover:text-purple-65 text-purple-82 size-6" />
                </Tooltip.Default>
              </div>
            )}
          </form.Field>
          <form.Field name="preparationIsAsync">
            {(field) => (
              <div className="group flex flex-row items-center gap-2">
                <Checkbox
                  name={field.name}
                  defaultChecked={field.state.value}
                  onCheckedChange={(state) =>
                    state !== 'indeterminate' && field.handleChange(state)
                  }
                />
                <FormLabel name={field.name}>
                  {t('scenarios:deployment_modal.prepare.preparation_is_async')}
                </FormLabel>
              </div>
            )}
          </form.Field>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button className="flex-1" variant="primary" type="submit">
            <Icon icon="queue-list" className="size-6" />
            {t('scenarios:deployment_modal.prepare.button')}
          </Button>
        </div>
      </div>
    </form>
  );
}
