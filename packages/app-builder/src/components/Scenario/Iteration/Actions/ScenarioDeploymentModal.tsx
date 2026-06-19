import { Callout } from '@app-builder/components/Callout';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { ScenarioIterationRuleMetadata } from '@app-builder/models/scenario/iteration-rule';
import { useActivateIterationMutation } from '@app-builder/queries/scenarios/activate-iteration';
import { useCommitIterationMutation } from '@app-builder/queries/scenarios/commit-iteration';
import { usePrepareIterationMutation } from '@app-builder/queries/scenarios/prepare-iteration';
import { usePublicationPreparationStatusQuery } from '@app-builder/queries/scenarios/publication-preparation-status';
import { useRuleSnoozesQuery } from '@app-builder/queries/scenarios/rule-snoozes';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, StepProgressBar, Tooltip } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';
import { RuleSnoozeDetail } from './RuleSnoozeDetail';

type DeploymentStep = 'draft' | 'commit' | 'prepare' | 'activate';

type DeploymentIteration = {
  id: string;
  type: 'draft' | 'version' | 'live version';
  isValid: boolean;
  status: 'required' | 'ready_to_activate';
};

type ScenarioDeploymentModalProps = {
  scenario: { id: string; isLive: boolean };
  iteration: DeploymentIteration;
  isPreparationServiceOccupied: boolean;
  rulesMetadata: ScenarioIterationRuleMetadata[];
};

type Bullet = { text: string; tooltip?: string };
type DeploymentStepDefinition = { key: DeploymentStep; label: string; isCurrent: boolean };

const PREPARATION_POLL_INTERVAL_MS = 2_000;
const PREPARATION_WAIT_CALLOUT_DELAY_MS = 1_000;

function* generateDeploymentSteps(
  iteration: DeploymentIteration,
  includePreparationStep: boolean,
  t: ReturnType<typeof useTranslation>['t'],
): Generator<DeploymentStepDefinition> {
  yield {
    key: 'draft',
    label: t('scenarios:deployment_modal.steps.draft'),
    isCurrent: false,
  };
  yield {
    key: 'commit',
    label: t('scenarios:deployment_modal.steps.commit'),
    isCurrent: iteration.type === 'draft',
  };
  if (includePreparationStep) {
    yield {
      key: 'prepare',
      label: t('scenarios:deployment_modal.steps.prepare'),
      isCurrent: iteration.type !== 'draft' && iteration.status === 'required',
    };
  }
  yield {
    key: 'activate',
    label: t('scenarios:deployment_modal.steps.activate'),
    isCurrent: iteration.type !== 'draft' && iteration.status === 'ready_to_activate',
  };
}

export function ScenarioDeploymentModal({
  scenario,
  iteration,
  isPreparationServiceOccupied,
  rulesMetadata,
}: ScenarioDeploymentModalProps) {
  const { t } = useTranslation(['common', 'scenarios']);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPreparationPollingStarted, setIsPreparationPollingStarted] = useState(false);
  const [shouldPersistPreparationStep, setShouldPersistPreparationStep] = useState(false);
  const [showPreparationWaitCallout, setShowPreparationWaitCallout] = useState(false);
  const revalidate = useLoaderRevalidator();

  const commitMutation = useCommitIterationMutation(scenario.id, iteration.id);
  const prepareMutation = usePrepareIterationMutation(scenario.id, iteration.id);
  const activateMutation = useActivateIterationMutation(scenario.id, iteration.id);
  const ruleSnoozesQuery = useRuleSnoozesQuery(scenario.id, iteration.id);

  const publicationPreparationStatusQuery = usePublicationPreparationStatusQuery(scenario.id, iteration.id, {
    enabled: isPreparationPollingStarted && iteration.status !== 'ready_to_activate',
    refetchInterval: (query) => {
      if (!isPreparationPollingStarted) return false;
      if (query.state.data?.status === 'ready_to_activate') return false;
      return PREPARATION_POLL_INTERVAL_MS;
    },
  });

  const effectiveIteration: DeploymentIteration = {
    ...iteration,
    status: publicationPreparationStatusQuery.data?.status ?? iteration.status,
  };
  const steps = Array.from(
    generateDeploymentSteps(effectiveIteration, iteration.status === 'required' || shouldPersistPreparationStep, t),
  );
  const currentStep = steps.find((step) => step.isCurrent)?.key ?? 'activate';
  const hasActivationBecomeAvailable = effectiveIteration.status === 'ready_to_activate';
  const isWaitingForActivation = isPreparationPollingStarted && !hasActivationBecomeAvailable;

  // Reset the error whenever the flow advances to a new step.
  useEffect(() => {
    setErrorMessage(null);
  }, [currentStep]);

  useEffect(() => {
    setIsPreparationPollingStarted(false);
    setShouldPersistPreparationStep(false);
    setShowPreparationWaitCallout(false);
  }, [iteration.id]);

  useEffect(() => {
    if (!isPreparationPollingStarted || !hasActivationBecomeAvailable) return;

    setIsPreparationPollingStarted(false);
    revalidate();
  }, [hasActivationBecomeAvailable, isPreparationPollingStarted, revalidate]);

  useEffect(() => {
    if (!isWaitingForActivation) {
      setShowPreparationWaitCallout(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowPreparationWaitCallout(true);
    }, PREPARATION_WAIT_CALLOUT_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [isWaitingForActivation]);

  const activeMutation =
    currentStep === 'commit' ? commitMutation : currentStep === 'prepare' ? prepareMutation : activateMutation;
  const isPending =
    activeMutation.isPending || isWaitingForActivation || (currentStep === 'activate' && ruleSnoozesQuery.isPending);

  const action: { label: string; icon: IconName } =
    currentStep === 'commit'
      ? { label: t('scenarios:deployment_modal.commit.button'), icon: 'commit' }
      : currentStep === 'prepare'
        ? { label: t('scenarios:deployment_modal.prepare.button'), icon: 'queue-list' }
        : { label: t('scenarios:deployment_modal.activate.button'), icon: 'pushtolive' };

  const title = t(`scenarios:deployment_modal.${currentStep}.title`);
  const confirm = t(`scenarios:deployment_modal.${currentStep}.confirm`);

  const bullets: Bullet[] =
    currentStep === 'commit'
      ? [
          {
            text: t('scenarios:deployment_modal.commit.draft_is_readonly'),
            tooltip: t('scenarios:deployment_modal.commit.draft_is_readonly.tooltip'),
          },
          {
            text: t('scenarios:deployment_modal.commit.activate_to_go_in_prod'),
            tooltip: t('scenarios:deployment_modal.commit.activate_to_go_in_prod.tooltip'),
          },
          { text: t('scenarios:deployment_modal.commit.change_is_immediate') },
        ]
      : currentStep === 'prepare'
        ? [
            {
              text: t('scenarios:deployment_modal.prepare.activate_to_go_in_prod'),
              tooltip: t('scenarios:deployment_modal.prepare.activate_to_go_in_prod.tooltip'),
            },
            { text: t('scenarios:deployment_modal.prepare.preparation_is_async') },
          ]
        : [
            {
              text: scenario.isLive
                ? t('scenarios:deployment_modal.activate.replace_current_live_version')
                : t('scenarios:deployment_modal.activate.will_be_live'),
              tooltip: t('scenarios:deployment_modal.activate.live_version.tooltip'),
            },
            { text: t('scenarios:deployment_modal.activate.change_is_immediate') },
          ];

  // Trigger gating mirrors the previous per-step buttons.
  const gating: { disabled: boolean; tooltip: string | null; variant: 'primary' | 'destructive' } = !iteration.isValid
    ? {
        disabled: true,
        tooltip: t(`scenarios:deployment_modal.${currentStep}.validation_error`),
        variant: currentStep === 'prepare' ? 'destructive' : 'primary',
      }
    : currentStep === 'prepare' && isPreparationServiceOccupied
      ? {
          disabled: true,
          tooltip: t('scenarios:deployment_modal.prepare.preparation_service_occupied'),
          variant: 'primary',
        }
      : { disabled: false, tooltip: null, variant: 'primary' };

  const handleAction = async () => {
    setErrorMessage(null);
    try {
      if (currentStep === 'commit') {
        const res = await commitMutation.mutateAsync({
          draftIsReadOnly: true,
          activateToGoInProd: true,
          changeIsImmediate: true,
        });
        if (res?.error) {
          setErrorMessage(
            res.error === 'validation_error'
              ? t('scenarios:deployment_modal.commit.validation_error')
              : t('common:errors.unknown'),
          );
          return;
        }
      } else if (currentStep === 'prepare') {
        const res = await prepareMutation.mutateAsync({ activateToGoInProd: true, preparationIsAsync: true });
        if (res?.error) {
          setErrorMessage(
            res.error === 'preparation_service_occupied'
              ? t('scenarios:deployment_modal.prepare.preparation_service_occupied')
              : t('common:errors.unknown'),
          );
          return;
        }
        setShouldPersistPreparationStep(true);
        setIsPreparationPollingStarted(true);
        return;
      } else {
        const res = await activateMutation.mutateAsync({ willBeLive: true, changeIsImmediate: true });
        if (res?.error) {
          setErrorMessage(getActivateErrorMessage(res.error, t));
          return;
        }
      }
      revalidate();
    } catch {
      setErrorMessage(t('common:errors.unknown'));
    }
  };

  const triggerButton = (
    <Button
      className="flex-1"
      variant={gating.variant}
      size="medium"
      disabled={gating.disabled}
      onClick={() => setOpen(true)}
    >
      <Icon icon={action.icon} className="size-5" />
      {action.label}
    </Button>
  );

  return (
    <>
      {gating.tooltip ? (
        <Tooltip.Default className="text-xs" content={gating.tooltip}>
          {triggerButton}
        </Tooltip.Default>
      ) : (
        triggerButton
      )}
      <Modal.Root
        open={open}
        onOpenChange={(nextOpen) => {
          if (!isPending) setOpen(nextOpen);
        }}
      >
        <Modal.Content
          onInteractOutside={(event) => {
            if (isPending) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (isPending) event.preventDefault();
          }}
        >
          <Modal.Title>{title}</Modal.Title>
          <div className="flex flex-col gap-6 p-6">
            <StepProgressBar steps={steps} value={currentStep} isPending={isPending} />
            <div className="text-s flex flex-col gap-4 font-medium">
              <p className="font-semibold">{confirm}</p>
              <ul className="flex list-disc flex-col gap-4 ps-5">
                {bullets.map((bullet) => (
                  <li key={bullet.text}>
                    <span className="inline-flex items-center gap-2">
                      {bullet.text}
                      {bullet.tooltip ? (
                        <Tooltip.Default content={<p className="max-w-60">{bullet.tooltip}</p>}>
                          <Icon icon="tip" className="hover:text-purple-primary text-purple-disabled size-5" />
                        </Tooltip.Default>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
              {currentStep === 'activate' ? (
                <div className="min-h-6 w-full">
                  <RuleSnoozeDetail scenarioId={scenario.id} iterationId={iteration.id} rulesMetadata={rulesMetadata} />
                </div>
              ) : null}
              {showPreparationWaitCallout ? (
                <Callout color="purple" icon="tip">
                  {t('scenarios:deployment_modal.prepare.waiting_for_activation')}
                </Callout>
              ) : null}
              {errorMessage ? <p className="text-s text-red-primary font-medium">{errorMessage}</p> : null}
            </div>
          </div>
          <Modal.Footer>
            <Modal.FooterButton
              isCloseButton
              label={t('common:cancel')}
              disabled={isPending}
              onClick={() => setOpen(false)}
            />
            <Modal.FooterButton
              label={action.label}
              disabled={isPending || !iteration.isValid}
              onClick={handleAction}
              isLoading={isPending}
              leadingIcon={action.icon}
            />
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}

function getActivateErrorMessage(
  error: 'validation_error' | 'preparation_is_required' | 'preparation_service_occupied' | 'is_draft' | 'unknown',
  t: ReturnType<typeof useTranslation>['t'],
): string {
  switch (error) {
    case 'validation_error':
      return t('scenarios:deployment_modal.activate.validation_error');
    case 'preparation_is_required':
      return t('scenarios:deployment_modal.activate.preparation_is_required_error');
    case 'preparation_service_occupied':
      return t('scenarios:deployment_modal.activate.preparation_service_occupied_error');
    case 'is_draft':
      return t('scenarios:deployment_modal.activate.is_draft_error');
    default:
      return t('common:errors.unknown');
  }
}
