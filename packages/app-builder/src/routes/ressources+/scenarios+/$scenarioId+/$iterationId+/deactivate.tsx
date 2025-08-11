import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { redirectBack } from 'remix-utils/redirect-back';
import { Button, Checkbox, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

const deactivateFormSchema = z.object({
  stopOperating: z.boolean().pipe(z.literal(true)),
  changeIsImmediate: z.boolean().pipe(z.literal(true)),
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

  const { error, success } = deactivateFormSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: z.treeifyError(error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await scenario.createScenarioPublication({
      publicationAction: 'unpublish',
      scenarioIterationId: iterationId,
    });

    return redirectBack(request, {
      fallback: getRoute('/scenarios/:scenarioId/i/:iterationId', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
        iterationId: fromUUIDtoSUUID(iterationId),
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

export function DeactivateScenarioVersion({
  scenarioId,
  iterationId,
}: {
  scenarioId: string;
  iterationId: string;
}) {
  const { t } = useTranslation(['scenarios']);
  const [open, setOpen] = React.useState(false);

  const navigation = useNavigation();
  React.useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button className="flex-1" variant="primary" color="red">
          <Icon icon="stop" className="size-6" />
          {t('scenarios:deployment_modal.deactivate.button')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <DeactivateScenarioVersionContent scenarioId={scenarioId} iterationId={iterationId} />
      </Modal.Content>
    </Modal.Root>
  );
}

function DeactivateScenarioVersionContent({
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
      stopOperating: false,
      changeIsImmediate: false,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/scenarios/:scenarioId/:iterationId/deactivate', {
            scenarioId: fromUUIDtoSUUID(scenarioId),
            iterationId: fromUUIDtoSUUID(iterationId),
          }),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onSubmitAsync: deactivateFormSchema,
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
      <Modal.Title>{t('scenarios:deployment_modal.deactivate.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex flex-col gap-4 font-medium">
          <p className="font-semibold">{t('scenarios:deployment_modal.deactivate.confirm')}</p>
          <form.Field
            name="stopOperating"
            validators={{
              onBlur: deactivateFormSchema.shape.stopOperating,
              onChange: deactivateFormSchema.shape.stopOperating,
            }}
          >
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
                  {t('scenarios:deployment_modal.deactivate.stop_operating')}
                </FormLabel>
              </div>
            )}
          </form.Field>
          <form.Field
            name="changeIsImmediate"
            validators={{
              onBlur: deactivateFormSchema.shape.changeIsImmediate,
              onChange: deactivateFormSchema.shape.changeIsImmediate,
            }}
          >
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
                  {t('scenarios:deployment_modal.deactivate.change_is_immediate')}
                </FormLabel>
              </div>
            )}
          </form.Field>
          <p className="text-grey-80 text-xs font-medium">
            {t('scenarios:deployment_modal.deactivate.helper')}
          </p>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button className="flex-1" variant="primary" type="submit" color="red">
            <Icon icon="stop" className="size-6" />
            {t('scenarios:deployment_modal.deactivate.button')}
          </Button>
        </div>
      </div>
    </form>
  );
}
