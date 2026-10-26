import { DeleteInboxContent } from '@app-builder/components/Settings/Inboxes/DeleteInbox';
import { InboxFormFields, useInboxForm } from '@app-builder/components/Settings/Inboxes/InboxFormFields';
import { InboxMembers } from '@app-builder/components/Settings/Inboxes/InboxMembers';
import { type InboxMetadata, type InboxWithCasesCount } from '@app-builder/models/inbox';
import { useCreateInboxMutation } from '@app-builder/queries/settings/inboxes/create-inbox';
import { useUpdateInboxMutation } from '@app-builder/queries/settings/inboxes/update-inbox';
import { type getInboxUserRoles } from '@app-builder/services/feature-access';
import { handleSubmit } from '@app-builder/utils/form';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useId, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Panel, Tag, Tooltip } from 'ui-design-system';

export type InboxPanelTarget = { mode: 'create' } | { mode: 'edit'; inboxId: string };

type InboxPanelProps = {
  inboxes: InboxWithCasesCount[];
  escalationInboxes: InboxMetadata[];
  isAutoAssignmentAvailable: boolean;
  isDeleteInboxAvailable: boolean;
  inboxUserRoles: ReturnType<typeof getInboxUserRoles>;
  userRolesAccess: FeatureAccessLevelDto;
};

export function InboxPanel({
  target,
  onClose,
  onInboxCreated,
  inboxes,
  ...props
}: InboxPanelProps & {
  target: InboxPanelTarget | null;
  onClose: () => void;
  onInboxCreated: (inboxId: string) => void;
}) {
  const inbox = target?.mode === 'edit' ? inboxes.find(({ id }) => id === target.inboxId) : undefined;
  const isOpen = target?.mode === 'create' || inbox !== undefined;

  return (
    <Panel.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Panel.Container size="medium">
        {isOpen ? (
          <InboxPanelContent
            key={inbox?.id ?? 'create'}
            inbox={inbox}
            onUpdated={onClose}
            onCreated={onInboxCreated}
            {...props}
          />
        ) : null}
      </Panel.Container>
    </Panel.Root>
  );
}

function InboxPanelContent({
  inbox,
  escalationInboxes,
  isAutoAssignmentAvailable,
  isDeleteInboxAvailable,
  inboxUserRoles,
  userRolesAccess,
  onUpdated,
  onCreated,
}: Omit<InboxPanelProps, 'inboxes'> & {
  inbox?: InboxWithCasesCount;
  onUpdated: () => void;
  onCreated: (inboxId: string) => void;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const formId = useId();
  const createInboxMutation = useCreateInboxMutation();
  const updateInboxMutation = useUpdateInboxMutation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useInboxForm({
    inbox,
    onSubmit: async (value) => {
      try {
        if (inbox) {
          await updateInboxMutation.mutateAsync({ ...value, id: inbox.id });
          toast.success(t('common:success.save'));
          queryClient.invalidateQueries({ queryKey: ['inboxes'] });
          router.invalidate();
          onUpdated();
        } else {
          const { inboxId } = await createInboxMutation.mutateAsync(value);
          toast.success(t('common:success.save'));
          queryClient.invalidateQueries({ queryKey: ['inboxes'] });
          await router.invalidate();
          onCreated(inboxId);
        }
      } catch {
        toast.error(t('common:errors.unknown'));
      }
    },
  });

  return (
    <Panel.Content>
      <Panel.Header>
        <div className="flex items-center justify-between gap-md">
          <div className="flex items-center gap-sm">
            {inbox ? t('settings:inboxes.panel.title') : t('settings:inboxes.new_inbox.create')}
            {inbox ? (
              <Tag color="grey" size="small">
                {t('settings:inboxes.panel.cases_count', { count: inbox.casesCount })}
              </Tag>
            ) : null}
          </div>
          {inbox && isDeleteInboxAvailable ? <DeleteInboxButton inbox={inbox} /> : null}
        </div>
      </Panel.Header>
      <div className="flex flex-col gap-2xl">
        <form id={formId} onSubmit={handleSubmit(form)} className="flex flex-col gap-lg">
          <InboxFormFields
            form={form}
            inboxId={inbox?.id}
            escalationInboxes={escalationInboxes}
            isAutoAssignmentAvailable={isAutoAssignmentAvailable}
          />
        </form>
        {inbox ? (
          <InboxMembers
            inbox={inbox}
            inboxUserRoles={inboxUserRoles}
            userRolesAccess={userRolesAccess}
            isAutoAssignmentAvailable={isAutoAssignmentAvailable}
          />
        ) : null}
      </div>
      <Panel.Footer>
        <form.Subscribe selector={(state) => [state.isSubmitting, state.values.name.trim() === ''] as const}>
          {([isSubmitting, isNameEmpty]) => (
            <>
              <Panel.FooterButton isCloseButton disabled={isSubmitting} label={t('common:cancel')} />
              <Panel.FooterButton
                type="submit"
                form={formId}
                variant="primary"
                disabled={isNameEmpty}
                isLoading={isSubmitting}
                label={inbox ? t('common:save') : t('settings:inboxes.new_inbox.create')}
              />
            </>
          )}
        </form.Subscribe>
      </Panel.Footer>
    </Panel.Content>
  );
}

function DeleteInboxButton({ inbox }: { inbox: InboxWithCasesCount }) {
  const { t } = useTranslation(['settings']);
  const [open, setOpen] = useState(false);

  if (inbox.hasCases) {
    return (
      <Tooltip.Default content={<p className="p-sm">{t('settings:inboxes.inbox_details.delete_inbox.tooltip')}</p>}>
        <span>
          <Button variant="destructive" appearance="stroked" size="medium" disabled>
            {t('settings:inboxes.delete_inbox')}
          </Button>
        </span>
      </Tooltip.Default>
    );
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button variant="destructive" appearance="stroked" size="medium">
          {t('settings:inboxes.delete_inbox')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <DeleteInboxContent inboxId={inbox.id} onSettled={() => setOpen(false)} />
      </Modal.Content>
    </Modal.Root>
  );
}
