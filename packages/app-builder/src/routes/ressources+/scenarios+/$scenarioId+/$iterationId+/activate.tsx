import { FormCheckbox } from '@app-builder/components/Form/FormCheckbox';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  IsDraftError,
  PreparationIsRequiredError,
  PreparationServiceOccupied,
  ValidationError,
} from '@app-builder/repositories/ScenarioRepository';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { redirectBack } from 'remix-utils/redirect-back';
import { Button, Modal, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const activateFormSchema = z
  .object({
    type: z.enum(['live', 'not_live']),
    replaceCurrentLiveVersion: z.coerce.boolean(),
    changeIsImmediate: z.coerce.boolean().pipe(z.literal(true)),
  })
  .refine(
    (data) => {
      if (data.type === 'live' && !data.replaceCurrentLiveVersion) {
        return false;
      }
      return true;
    },
    {
      path: ['replaceCurrentLiveVersion'],
    },
  );

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService, csrfService } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  await csrfService.validate(request);
  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  const formData = await request.formData();
  const submission = parse(formData, { schema: activateFormSchema });
  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission);
  }

  try {
    await scenario.createScenarioPublication({
      publicationAction: 'publish',
      scenarioIterationId: iterationId,
    });

    return redirectBack(request, {
      fallback: getRoute('/scenarios/:scenarioId/i/:iterationId', {
        scenarioId: fromUUID(scenarioId),
        iterationId: fromUUID(iterationId),
      }),
    });
  } catch (error) {
    const {
      i18nextService: { getFixedT },
      toastSessionService: { getSession, commitSession },
    } = serverServices;
    const t = await getFixedT(request, ['scenarios', 'common']);
    const session = await getSession(request);
    if (error instanceof ValidationError) {
      setToastMessage(session, {
        type: 'error',
        message: t('scenarios:deployment_modal.activate.validation_error'),
      });
    } else if (error instanceof PreparationIsRequiredError) {
      setToastMessage(session, {
        type: 'error',
        message: t(
          'scenarios:deployment_modal.activate.preparation_is_required_error',
        ),
      });
    } else if (error instanceof PreparationServiceOccupied) {
      setToastMessage(session, {
        type: 'error',
        message: t(
          'scenarios:deployment_modal.activate.preparation_service_occupied_error',
        ),
      });
    } else if (error instanceof IsDraftError) {
      setToastMessage(session, {
        type: 'error',
        message: t('scenarios:deployment_modal.activate.is_draft_error'),
      });
    } else {
      setToastMessage(session, {
        type: 'error',
        message: t('common:errors.unknown'),
      });
    }
    return json(submission, {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }
}

export function ActivateScenarioVersion({
  scenario,
  iteration,
}: {
  scenario: {
    id: string;
    isLive: boolean;
  };
  iteration: {
    id: string;
    isValid: boolean;
  };
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const [open, setOpen] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  const button = (
    <Button className="flex-1" variant="primary" disabled={!iteration.isValid}>
      <Icon icon="pushtolive" className="size-6" />
      {t('scenarios:deployment_modal.activate.button')}
    </Button>
  );

  if (!iteration.isValid) {
    return (
      <Tooltip.Default
        className="text-xs"
        content={t('scenarios:deployment_modal.activate.validation_error')}
      >
        {button}
      </Tooltip.Default>
    );
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{button}</Modal.Trigger>
      <Modal.Content>
        <ActivateScenarioVersionContent
          scenario={scenario}
          iterationId={iteration.id}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

function ActivateScenarioVersionContent({
  scenario,
  iterationId,
}: {
  scenario: {
    id: string;
    isLive: boolean;
  };
  iterationId: string;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const fetcher = useFetcher<typeof action>();

  const formId = useId();
  const [form, { type, changeIsImmediate, replaceCurrentLiveVersion }] =
    useForm({
      id: formId,
      defaultValue: {
        type: scenario.isLive ? 'live' : 'not_live',
        changeIsImmediate: false,
        replaceCurrentLiveVersion: false,
      },
      lastSubmission: fetcher.data,
      constraint: getFieldsetConstraint(activateFormSchema),
      onValidate({ formData }) {
        return parse(formData, {
          schema: activateFormSchema,
        });
      },
    });

  return (
    <fetcher.Form
      action={getRoute(
        '/ressources/scenarios/:scenarioId/:iterationId/activate',
        {
          scenarioId: fromUUID(scenario.id),
          iterationId: fromUUID(iterationId),
        },
      )}
      method="POST"
      {...form.props}
    >
      <Modal.Title>
        {t('scenarios:deployment_modal.activate.title')}
      </Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <AuthenticityTokenInput />
        <div className="text-s mb-6 flex flex-col gap-6 font-medium">
          <p className="font-semibold">
            {t('scenarios:deployment_modal.activate.confirm')}
          </p>
          <input {...conform.input(type, { type: 'hidden' })} />
          {scenario.isLive ? (
            <FormField
              config={replaceCurrentLiveVersion}
              className="group flex flex-row items-center gap-2"
            >
              <FormCheckbox />
              <FormLabel>
                {t(
                  'scenarios:deployment_modal.activate.replace_current_live_version',
                )}
              </FormLabel>
            </FormField>
          ) : null}
          <FormField
            config={changeIsImmediate}
            className="group flex flex-row items-center gap-2"
          >
            <FormCheckbox />
            <FormLabel>
              {t('scenarios:deployment_modal.activate.change_is_immediate')}
            </FormLabel>
          </FormField>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button className="flex-1" variant="primary" type="submit">
            <Icon icon="play" className="size-6" />
            {t('scenarios:deployment_modal.activate.button')}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
}
