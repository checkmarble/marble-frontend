import { navigationI18n } from '@app-builder/components';
import { isStatusBadRequestHttpError } from '@app-builder/models';
import { type SortedScenarioIteration } from '@app-builder/models/scenario-iteration';
import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { Label } from '@radix-ui/react-label';
import { type ActionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import {
  Button,
  type ButtonProps,
  Checkbox,
  HiddenInputs,
  Modal,
} from '@ui-design-system';
import { Play, Pushtolive, Stop, Tick } from '@ui-icons';
import { type Namespace, type ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

import { setToastMessage } from '../../../components/MarbleToaster';

export const handle = {
  i18n: [...navigationI18n, 'scenarios', 'common'] satisfies Namespace,
};

/**
 * TODO
 * - Ajouter RHF
 *  - Faire fonctionner les erreurs client side classique RHF
 *  - Regarder remix-form pour trouver un moyen de faire du merge client/serveur
 *
 * - Tenter de factoriser des helpers
 */

const Deployment = ['activate', 'deactivate', 'reactivate'] as const;
type DeploymentType = (typeof Deployment)[number];

const formSchema = z.object({
  deploymentType: z.enum(Deployment),
  iterationId: z.string().uuid(),

  // TODO: factorize common FormData parser, add superRefine to cast on known errors (ex: "required" in this context)
  replaceCurrentLiveVersion: z.coerce
    .boolean()
    .refine((val) => val === true, 'Required'),

  changeIsImmediate: z.coerce
    .boolean()
    .refine((val) => val === true, 'Required'),
});

export async function action({ request }: ActionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const parsedForm = await parseFormSafe(request, formSchema);
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: parsedForm.formData,
      error: parsedForm.error.format(),
    });
  }
  try {
    const { iterationId, deploymentType } = parsedForm.data;

    await apiClient.createScenarioPublication({
      publicationAction:
        deploymentType === 'deactivate' ? 'unpublish' : 'publish',
      scenarioIterationId: iterationId,
    });

    return json({
      success: true as const,
      error: null,
      values: parsedForm.data,
    });
  } catch (error) {
    const { getSession, commitSession } = serverServices.sessionService;
    const session = await getSession(request);

    if (isStatusBadRequestHttpError(error)) {
      setToastMessage(session, {
        type: 'error',
        messageKey: 'common:errors.draft.invalid',
      });
    } else {
      setToastMessage(session, {
        type: 'error',
        messageKey: 'common:errors.unknown',
      });
    }

    return json(
      {
        success: false as const,
        error: null,
        values: parsedForm.data,
      },
      { headers: { 'Set-Cookie': await commitSession(session) } }
    );
  }
}

function ModalContent({
  scenarioId,
  liveVersionId,
  currentIteration,
}: {
  scenarioId: string;
  liveVersionId?: string;
  currentIteration: SortedScenarioIteration;
}) {
  const { t } = useTranslation(handle.i18n);

  //TODO(transition): add loading during form submission
  const fetcher = useFetcher<typeof action>();

  const deploymentType = getDeploymentType(currentIteration.type);
  const buttonConfig = getButtonConfig(deploymentType);

  const { state, data } = fetcher;
  const isSuccess = state === 'idle' && data?.success === true;
  const error = data?.error;

  return isSuccess ? (
    // In success modal, use data.values.deploymentType (action will update deploymentType to the new state)
    <div className="flex flex-col items-center p-8 text-center">
      <Tick
        width="108px"
        height="108px"
        className="bg-purple-10 border-purple-10 mb-8 rounded-full border-8 text-purple-100"
      />
      <Modal.Title className="text-l text-grey-100 mb-2 font-semibold">
        {t(
          `scenarios:deployment_modal_success.${data.values.deploymentType}.title`
        )}
      </Modal.Title>
      <p className="text-s text-grey-100 mb-8 font-normal">
        {t(
          `scenarios:deployment_modal_success.${data.values.deploymentType}.description`
        )}
      </p>
      <Modal.Close asChild>
        <Button variant="secondary">{t('common:close')}</Button>
      </Modal.Close>
    </div>
  ) : (
    <>
      <Modal.Title>
        {t(`scenarios:deployment_modal.${deploymentType}.title`)}
      </Modal.Title>
      <fetcher.Form
        className="bg-grey-00 flex-col p-8"
        method="POST"
        action="/ressources/scenarios/deployment"
      >
        <HiddenInputs
          deploymentType={deploymentType}
          scenarioId={scenarioId}
          liveVersionId={liveVersionId}
          iterationId={currentIteration.id}
        />
        <div className="text-s mb-8 flex flex-col gap-6 font-medium">
          <p className="font-semibold">
            {t(`scenarios:deployment_modal.${deploymentType}.confirm`)}
          </p>
          <div className="flex flex-col ">
            <div className="flex flex-row items-center gap-2">
              <Checkbox
                id="replaceCurrentLiveVersion"
                name="replaceCurrentLiveVersion"
                color={error?.replaceCurrentLiveVersion?._errors && 'red'}
              />
              <Label htmlFor="replaceCurrentLiveVersion">
                {t(
                  `scenarios:deployment_modal.${deploymentType}.replace_current_live_version`
                )}
              </Label>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row gap-2">
              <Checkbox
                id="changeIsImmediate"
                name="changeIsImmediate"
                color={error?.changeIsImmediate?._errors && 'red'}
              />
              <Label htmlFor="changeIsImmediate">
                {t(
                  `scenarios:deployment_modal.${deploymentType}.change_is_immediate`
                )}
              </Label>
            </div>
          </div>
        </div>

        {deploymentType === 'deactivate' && (
          <p className="text-grey-25 mb-4 text-xs font-medium">
            {t(`scenarios:deployment_modal.${deploymentType}.helper`)}
          </p>
        )}

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
            {...buttonConfig.props}
          >
            <buttonConfig.icon.submit height="24px" width="24px" />
            {t(buttonConfig.label)}
          </Button>
        </div>
      </fetcher.Form>
    </>
  );
}

export function DeploymentModal({
  scenarioId,
  liveVersionId,
  currentIteration,
}: {
  scenarioId: string;
  liveVersionId?: string;
  currentIteration: SortedScenarioIteration;
}) {
  const { t } = useTranslation(handle.i18n);

  const deploymentType = getDeploymentType(currentIteration.type);
  const buttonConfig = getButtonConfig(deploymentType);

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button {...buttonConfig.props}>
          <buttonConfig.icon.trigger height="24px" width="24px" />
          {t(buttonConfig.label)}
        </Button>
      </Modal.Trigger>
      <Modal.Content className="bg-grey-00">
        <ModalContent
          scenarioId={scenarioId}
          liveVersionId={liveVersionId}
          currentIteration={currentIteration}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

function getDeploymentType(
  type: SortedScenarioIteration['type']
): DeploymentType {
  switch (type) {
    case 'draft':
      return 'activate';
    case 'live version':
      return 'deactivate';
    case 'past version':
      return 'reactivate';
  }
}

function getButtonConfig(type: DeploymentType): {
  props: Pick<ButtonProps, 'color'>;
  icon: {
    trigger: typeof Play;
    submit: typeof Play;
  };
  label: ParseKeys<['scenarios']>;
} {
  switch (type) {
    case 'activate':
      return {
        label: 'scenarios:deployment_modal.activate.button',
        props: { color: 'purple' },
        icon: { trigger: Pushtolive, submit: Play },
      };
    case 'deactivate':
      return {
        label: 'scenarios:deployment_modal.deactivate.button',
        props: { color: 'red' },
        icon: { trigger: Stop, submit: Stop },
      };
    case 'reactivate':
      return {
        label: 'scenarios:deployment_modal.reactivate.button',
        props: { color: 'purple' },
        icon: { trigger: Pushtolive, submit: Play },
      };
  }
}
