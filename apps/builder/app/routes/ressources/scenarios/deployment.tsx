import { createScenarioPublication } from '@marble-front/api/marble';
import { navigationI18n } from '@marble-front/builder/components';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import {
  commitSession,
  getSession,
} from '@marble-front/builder/services/auth/session.server';
import { parseFormSafe } from '@marble-front/builder/utils/input-validation';
import {
  Button,
  type ButtonProps,
  Checkbox,
  HiddenInputs,
  Modal,
} from '@marble-front/ui/design-system';
import { Play, Pushtolive, Stop, Tick } from '@marble-front/ui/icons';
import { Label } from '@radix-ui/react-label';
import { type ActionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace, type TFuncKey } from 'i18next';
import { LoaderIcon } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

import { setToastMessage } from '../../../components/MarbleToaster';
import { type SortedScenarioIteration } from '../../__builder/scenarios/$scenarioId/i/$incrementId/view';

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
  incrementId: z.string().uuid(),

  // TODO: factorize common FormData parser, add superRefine to cast on known errors (ex: "required" in this context)
  replaceCurrentLiveVersion: z.coerce
    .boolean()
    .refine((val) => val === true, 'Required'),

  changeIsImmediate: z.coerce
    .boolean()
    .refine((val) => val === true, 'Required'),
});

export async function action({ request }: ActionArgs) {
  await authenticator.isAuthenticated(request, {
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
    const { incrementId, deploymentType } = parsedForm.data;

    await createScenarioPublication({
      publicationAction:
        deploymentType === 'deactivate' ? 'unpublish' : 'publish',
      scenarioIterationId: incrementId,
    });

    return json({
      success: true as const,
      error: null,
      values: parsedForm.data,
    });
  } catch (error) {
    const session = await getSession(request.headers.get('cookie'));
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

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
  currentIncrement,
}: {
  scenarioId: string;
  liveVersionId?: string;
  currentIncrement: SortedScenarioIteration;
}) {
  const { t } = useTranslation(handle.i18n);

  //TODO(transition): add loading during form submission
  const fetcher = useFetcher<typeof action>();

  const deploymentType = getDeploymentType(currentIncrement.type);
  const buttonConfig = getButtonConfig(deploymentType);

  const isSuccess = fetcher.type === 'done' && fetcher.data?.success === true;

  const error = fetcher.data?.error;

  return isSuccess ? (
    // In success modal, use fetcher.data.values.deploymentType (action will update deploymentType to the new state)
    <div className="flex flex-col items-center p-8 text-center">
      <Tick
        width="108px"
        height="108px"
        className="bg-purple-10 border-purple-10 mb-8 rounded-full border-8 text-purple-100"
      />
      <Modal.Title className="text-l text-grey-100 mb-2 font-semibold">
        {t(
          `scenarios:deployment_modal_success.${fetcher.data.values.deploymentType}.title`
        )}
      </Modal.Title>
      <p className="text-s text-grey-100 mb-8 font-normal">
        {t(
          `scenarios:deployment_modal_success.${fetcher.data.values.deploymentType}.description`
        )}
      </p>
      <Modal.Close asChild autoFocus>
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
        method="post"
        action="/ressources/scenarios/deployment"
      >
        <HiddenInputs
          deploymentType={deploymentType}
          scenarioId={scenarioId}
          liveVersionId={liveVersionId}
          incrementId={currentIncrement.id}
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
  currentIncrement,
}: {
  scenarioId: string;
  liveVersionId?: string;
  currentIncrement: SortedScenarioIteration;
}) {
  const { t } = useTranslation(handle.i18n);

  const deploymentType = getDeploymentType(currentIncrement.type);
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
          currentIncrement={currentIncrement}
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
  label: TFuncKey<['scenarios']>;
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
