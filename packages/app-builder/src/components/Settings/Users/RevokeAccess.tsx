import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useRevokeOrganizationAccessMutation } from '@app-builder/queries/settings/users/revoke-organization-access';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function RevokeAccess({ userId }: { userId: string }) {
  const { t } = useTranslation(['settings']);
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <Icon icon="delete" className="size-6 shrink-0" aria-label={t('settings:users.revoke_access')} />
      </Modal.Trigger>
      <Modal.Content>
        <RevokeAccessContent userId={userId} onSuccess={() => setOpen(false)} />
      </Modal.Content>
    </Modal.Root>
  );
}

function RevokeAccessContent({ userId, onSuccess }: { userId: string; onSuccess: () => void }) {
  const { t } = useTranslation(['common', 'settings']);
  const revokeAccessMutation = useRevokeOrganizationAccessMutation();
  const revalidate = useLoaderRevalidator();

  const handleRevoke = () => {
    revokeAccessMutation
      .mutateAsync({ userId })
      .then(() => {
        toast.success(t('settings:users.revoke_access.success'));
        onSuccess();
        revalidate();
      })
      .catch(() => {
        toast.error(t('common:errors.unknown'));
      });
  };

  return (
    <>
      <Modal.Title>{t('settings:users.revoke_access.title')}</Modal.Title>
      <p className="p-lg text-s">{t('settings:users.revoke_access.content')}</p>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <Modal.FooterButton
          label={t('settings:users.revoke_access.confirm')}
          variant="destructive"
          onClick={handleRevoke}
          disabled={revokeAccessMutation.isPending}
          isLoading={revokeAccessMutation.isPending}
        />
      </Modal.Footer>
    </>
  );
}
