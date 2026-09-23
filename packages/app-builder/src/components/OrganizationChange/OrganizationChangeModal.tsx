import { Spinner } from '@app-builder/components/Spinner';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type OrganizationChangeModalPhase = 'pending' | 'decision' | 'returning' | 'error';

interface OrganizationChangeModalProps {
  phase: OrganizationChangeModalPhase;
  previousOrganizationName: string;
  nextOrganizationName: string;
  onAcceptNextOrganization: () => void;
  onReturnToPreviousOrganization: () => void;
}

export function OrganizationChangeModal({
  phase,
  previousOrganizationName,
  nextOrganizationName,
  onAcceptNextOrganization,
  onReturnToPreviousOrganization,
}: OrganizationChangeModalProps) {
  const { t } = useTranslation('navigation');
  const returnButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (phase === 'decision' || phase === 'error') {
      returnButtonRef.current?.focus();
    }
  }, [phase]);

  const isWaiting = phase === 'pending' || phase === 'returning';
  const description = (() => {
    if (phase === 'pending') {
      return t('organization_change.pending', {
        previousOrganization: previousOrganizationName,
        nextOrganization: nextOrganizationName,
      });
    }

    if (phase === 'returning') {
      return t('organization_change.returning', { organization: previousOrganizationName });
    }

    if (phase === 'error') {
      return t('organization_change.return_error', {
        previousOrganization: previousOrganizationName,
        nextOrganization: nextOrganizationName,
      });
    }

    return t('organization_change.description', {
      previousOrganization: previousOrganizationName,
      nextOrganization: nextOrganizationName,
    });
  })();

  return (
    <Modal.Root open onOpenChange={() => undefined}>
      <Modal.Content
        size="medium"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <Modal.Title>{t('organization_change.title')}</Modal.Title>
        <Modal.Description className="flex items-start gap-sm p-md text-s text-grey-primary" aria-live="polite">
          {isWaiting ? <Icon icon="spinner" className="mt-2xs size-5 shrink-0 animate-spin" /> : null}
          <span>{description}</span>
        </Modal.Description>
        {!isWaiting ? (
          <Modal.Footer>
            <Modal.FooterButton
              variant="secondary"
              label={t('organization_change.accept', { organization: nextOrganizationName })}
              onClick={onAcceptNextOrganization}
            />
            <Modal.FooterButton
              ref={returnButtonRef}
              label={
                phase === 'error'
                  ? t('organization_change.retry_return', { organization: previousOrganizationName })
                  : t('organization_change.return', { organization: previousOrganizationName })
              }
              onClick={onReturnToPreviousOrganization}
            />
          </Modal.Footer>
        ) : null}
      </Modal.Content>
    </Modal.Root>
  );
}

interface OrganizationSwitchingModalProps {
  organizationName: string;
}

export function OrganizationSwitchingModal({ organizationName }: OrganizationSwitchingModalProps) {
  const { t } = useTranslation('navigation');

  return (
    <Modal.Root open onOpenChange={() => undefined}>
      <Modal.Content
        size="small"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <Modal.Title>{t('organization_change.switching_title')}</Modal.Title>
        <Modal.Description className="flex items-center gap-sm p-md text-s text-grey-primary" aria-live="polite">
          <Spinner className="size-5" />
          <span>{t('organization_change.switching', { organization: organizationName })}</span>
        </Modal.Description>
      </Modal.Content>
    </Modal.Root>
  );
}
