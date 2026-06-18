import { Callout, casesI18n } from '@app-builder/components';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { isAdmin } from '@app-builder/models/user';
import { escalateCasePayloadSchema, useEscalateCaseMutation } from '@app-builder/queries/cases/escalate-case';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { handleSubmit } from '@app-builder/utils/form';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useForm } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Modal, TooltipV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

type EscalateCaseButtonProps = {
  caseId: string;
  inboxId: string;
  className?: string;
};

export function EscalateCaseButton({ caseId, inboxId, className }: EscalateCaseButtonProps) {
  const { t } = useTranslation([...casesI18n, 'common']);
  const escalateCaseMutation = useEscalateCaseMutation();
  const revalidate = useLoaderRevalidator();
  const inboxesQuery = useGetInboxesQuery();
  const { currentUser } = useOrganizationDetails();
  const isAdminUser = isAdmin(currentUser);

  const inboxes = inboxesQuery.data?.inboxes ?? [];
  const inboxDetail = inboxes.find((inbox) => inbox.id === inboxId);
  const targetInbox = inboxes.find((inbox) => inbox.id === inboxDetail?.escalationInboxId);
  const canEscalate = !!inboxDetail?.escalationInboxId;

  const form = useForm({
    onSubmit: async ({ value }) => {
      escalateCaseMutation
        .mutateAsync(value)
        .then(() => {
          revalidate();
        })
        .catch(() => {
          toast.error(t('common:errors.unknown'));
        });
    },
    defaultValues: { caseId, inboxId },
    validators: {
      onSubmit: escalateCasePayloadSchema,
    },
  });

  return (
    <Modal.Root>
      <TooltipV2.Tooltip delayDuration={0}>
        <TooltipV2.TooltipTrigger asChild>
          <Modal.Trigger asChild>
            <Button
              variant="secondary"
              size="small"
              mode="icon"
              className={className}
              disabled={!canEscalate}
              aria-label={t('cases:escalate-button.label')}
            >
              <Icon icon="arrow-up" className="size-4" />
            </Button>
          </Modal.Trigger>
        </TooltipV2.TooltipTrigger>
        <TooltipV2.TooltipContent>
          <div>
            {canEscalate
              ? t('cases:escalate-button.hint', { inboxName: targetInbox?.name })
              : isAdminUser
                ? t('cases:escalate-button.forbidden.hint.admin')
                : t('cases:escalate-button.forbidden.hint')}
          </div>
          {!canEscalate && isAdminUser ? (
            <Link
              to="/settings/inboxes/$inboxId"
              params={{ inboxId: fromUUIDtoSUUID(inboxId) }}
              className="hover:text-purple-hover focus:text-purple-hover text-purple-primary font-semibold hover:underline focus:underline"
            >
              {t('cases:case.inbox_settings_link')}
            </Link>
          ) : null}
        </TooltipV2.TooltipContent>
      </TooltipV2.Tooltip>
      <Modal.Content>
        <Modal.Title>Escalate Case</Modal.Title>
        <div className="flex flex-col gap-xl p-xl">
          <Callout className="text-balance">
            <Trans i18nKey="cases:escalate-case.modal.callout" />
          </Callout>
        </div>
        <form onSubmit={handleSubmit(form)}>
          <Modal.Footer>
            <Modal.FooterButton isCloseButton label={t('common:cancel')} />
            <Modal.FooterButton label={t('cases:escalate-case.modal.submit-button.label')} type="submit" />
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
