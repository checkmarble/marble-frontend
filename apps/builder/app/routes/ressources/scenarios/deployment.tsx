import { useFetcher } from '@remix-run/react';
import { Play, Pushtolive, Stop, Tick } from '@marble-front/ui/icons';
import { navigationI18n } from '@marble-front/builder/components';
import { fromUUID } from '@marble-front/builder/utils/short-uuid';
import type { ButtonProps } from '@marble-front/ui/design-system';
import {
  Button,
  Checkbox,
  HiddenInputs,
  Modal,
} from '@marble-front/ui/design-system';
import { useTranslation } from 'react-i18next';
import { Label } from '@radix-ui/react-label';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { scenariosApi } from '@marble-front/builder/services/marble-api';
import type { ActionArgs } from '@remix-run/node';
import { redirect, json } from '@remix-run/node';

import * as z from 'zod';

import { forwardRef } from 'react';
import { parseFormSafe } from '@marble-front/builder/utils/input-validation';
import type { Increment } from '@marble-front/builder/routes/__builder/scenarios/$scenarioId';
import { getReferer } from '@marble-front/builder/services/routes';
import type { TFuncKey } from 'i18next';

export const handle = {
  i18n: [...navigationI18n, 'scenarios', 'common'] as const,
};

/**
 * TODO
 * - Faire à la mano la couche de validation à partir du schema
 *  - Faire tout fonctionner sans RHF
 *  - Ajouter de la gestion d'erreur rapidement
 *
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
  scenarioId: z.string().uuid(),
  incrementId: z.string().uuid(),
  scenarioVersionToActivateId: z.string().uuid(),

  // TODO: factorize common FormData parser, add superRefine to cast on known errors (ex: "required" in this context)
  replaceCurrentLiveVersion: z.coerce
    .boolean()
    .refine((val) => val === true, 'Required'),

  changeIsImmediate: z.coerce
    .boolean()
    .refine((val) => val === true, 'Required'),
});

export async function action({ request }: ActionArgs) {
  const user = await authenticator.isAuthenticated(request, {
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
    const {
      scenarioId,
      scenarioVersionToActivateId,
      incrementId,
      deploymentType,
    } = parsedForm.data;
    const result = await scenariosApi.postScenariosScenarioIdDeployments({
      scenarioId,
      scenarioDeploymentToCreate: {
        authorId: user.id,
        scenarioVersionToActivateId:
          deploymentType === 'deactivate'
            ? undefined
            : scenarioVersionToActivateId,
      },
    });

    //TODO: fix when better OpenAPIv3 spec is provided
    const newIncrementId = JSON.parse(result).id;
    const referer =
      getReferer(request) ??
      `/scenarios/${fromUUID(scenarioId)}/i/${fromUUID(
        incrementId
      )}/view/trigger`;

    return redirect(
      deploymentType === 'deactivate'
        ? referer
        : referer.replace(fromUUID(incrementId), fromUUID(newIncrementId))
    );
  } catch (error) {
    /**
     * TODO: handle server errors properly :
     * - return a "global" error message with default to "unknown error"
     * - live version === scenarioVersionToActivateId
     */
    return json({
      success: false as const,
      error: null,
      values: parsedForm,
    });
  }
}

function ModalContent({
  scenarioId,
  currentIncrement,
}: {
  scenarioId: string;
  currentIncrement: Increment;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const deploymentType = getDeploymentType(currentIncrement.type);
  const translationKeys = getTranslationKeys(deploymentType);
  const buttonConfig = getButtonConfig(deploymentType);

  const error = fetcher.data?.error;
  console.log(fetcher);

  const isSuccess = fetcher.type === 'done' && fetcher.data?.success !== false;

  return (
    <Modal.Content className="bg-grey-00">
      {isSuccess ? (
        <div className="flex flex-col items-center p-8 text-center">
          <Tick
            width="108px"
            height="108px"
            className="bg-purple-10 border-purple-10 mb-8 rounded-full border-8 text-purple-100"
          />
          <Modal.Title className="text-l text-grey-100 mb-2 font-semibold">
            {t(translationKeys.success_title)}
          </Modal.Title>
          <p className="text-s text-grey-100 mb-8 font-normal">
            {t(translationKeys.success_description)}
          </p>
          <Modal.Close asChild autoFocus>
            <Button variant="secondary">{t('common:close')}</Button>
          </Modal.Close>
        </div>
      ) : (
        <>
          <Modal.Title>{t(translationKeys.title)}</Modal.Title>
          <fetcher.Form
            className="bg-grey-00 flex-col p-8"
            method="post"
            action="/ressources/scenarios/deployment"
          >
            <HiddenInputs
              deploymentType={deploymentType}
              scenarioId={scenarioId}
              incrementId={currentIncrement.id}
              scenarioVersionToActivateId={currentIncrement.versionId}
            />
            <div className="text-s mb-8 flex flex-col gap-6 font-medium">
              <p className="font-semibold">{t(translationKeys.confirm)}</p>
              <div className="flex flex-col ">
                <div className="flex flex-row items-center gap-2">
                  <Checkbox
                    id="replaceCurrentLiveVersion"
                    name="replaceCurrentLiveVersion"
                    color={error?.replaceCurrentLiveVersion?._errors && 'red'}
                  />
                  <Label htmlFor="replaceCurrentLiveVersion">
                    {t(translationKeys.replace_current_live_version)}
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
                    {t(translationKeys.change_is_immediate)}
                  </Label>
                </div>
              </div>
            </div>

            {translationKeys.helper && (
              <p className="text-grey-25 mb-4 text-xs font-medium">
                {t(translationKeys.helper)}
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
      )}
    </Modal.Content>
  );
}

export const DeploymentModalButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'ref'> & {
    type: 'trigger' | 'submit';
    deploymentType: DeploymentType;
  }
>(({ type, deploymentType, ...props }, ref) => {
  const { t } = useTranslation(handle.i18n);
  const buttonConfig = getButtonConfig(deploymentType);
  const Icon = buttonConfig.icon[type];

  return (
    <Button ref={ref} {...props} {...buttonConfig.props}>
      <Icon height="24px" width="24px" />
      {t(buttonConfig.label)}
    </Button>
  );
});

export function DeploymentModal({
  scenarioId,
  currentIncrement,
}: {
  scenarioId: string;
  currentIncrement: Increment;
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
      <Modal.Portal>
        <ModalContent
          scenarioId={scenarioId}
          currentIncrement={currentIncrement}
        />
      </Modal.Portal>
    </Modal.Root>
  );
}

function getDeploymentType(type: Increment['type']): DeploymentType {
  switch (type) {
    case 'draft':
      return 'activate';
    case 'live version':
      return 'deactivate';
    case 'past version':
      return 'reactivate';
  }
}

function getTranslationKeys(type: DeploymentType): {
  title: TFuncKey<['scenarios']>;
  confirm: TFuncKey<['scenarios']>;
  replace_current_live_version: TFuncKey<['scenarios']>;
  change_is_immediate: TFuncKey<['scenarios']>;
  helper?: TFuncKey<['scenarios']>;
  success_title: TFuncKey<['scenarios']>;
  success_description: TFuncKey<['scenarios']>;
} {
  switch (type) {
    case 'activate':
      return {
        title: 'scenarios:deployment_modal.activate.title',
        confirm: 'scenarios:deployment_modal.activate.confirm',
        replace_current_live_version:
          'scenarios:deployment_modal.activate.replace_current_live_version',
        change_is_immediate:
          'scenarios:deployment_modal.activate.change_is_immediate',
        success_title: 'scenarios:deployment_modal_success.activate.title',
        success_description:
          'scenarios:deployment_modal_success.activate.description',
      };
    case 'deactivate':
      return {
        title: 'scenarios:deployment_modal.deactivate.title',
        confirm: 'scenarios:deployment_modal.deactivate.confirm',
        replace_current_live_version:
          'scenarios:deployment_modal.deactivate.replace_current_live_version',
        helper: 'scenarios:deployment_modal.deactivate.helper',
        change_is_immediate:
          'scenarios:deployment_modal.deactivate.change_is_immediate',
        success_title: 'scenarios:deployment_modal_success.deactivate.title',
        success_description:
          'scenarios:deployment_modal_success.deactivate.description',
      };
    case 'reactivate':
      return {
        title: 'scenarios:deployment_modal.reactivate.title',
        confirm: 'scenarios:deployment_modal.reactivate.confirm',
        replace_current_live_version:
          'scenarios:deployment_modal.reactivate.replace_current_live_version',
        change_is_immediate:
          'scenarios:deployment_modal.reactivate.change_is_immediate',
        success_title: 'scenarios:deployment_modal_success.reactivate.title',
        success_description:
          'scenarios:deployment_modal_success.reactivate.description',
      };
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
