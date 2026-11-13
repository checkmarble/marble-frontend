import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useGrantOrganizationAccessMutation } from '@app-builder/queries/settings/users/grant-organization-access';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { UserRoleField } from './UserRoleField';
import { type UserRoleOption } from './UserRoleSelector';

interface GrantAccessProps {
  userId: string;
  userRoles: readonly UserRoleOption[];
  access: FeatureAccessLevelDto;
}

// Gives a user of the tenant access to the organization, with a role.
export function GrantAccess({ userId, userRoles, access }: GrantAccessProps) {
  const { t } = useTranslation(['settings']);
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button appearance="stroked" variant="primary" size="small">
          <Icon icon="plus" className="size-4" />
          {t('settings:users.grant_access.add')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <GrantAccessContent userId={userId} userRoles={userRoles} access={access} onSuccess={() => setOpen(false)} />
      </Modal.Content>
    </Modal.Root>
  );
}

function GrantAccessContent({ userId, userRoles, access, onSuccess }: GrantAccessProps & { onSuccess: () => void }) {
  const { t } = useTranslation(['common', 'settings']);
  const grantAccessMutation = useGrantOrganizationAccessMutation();
  const revalidate = useLoaderRevalidator();
  // The role select is disabled when a single role can be granted
  const [role, setRole] = useState<string | null>(userRoles.length === 1 ? (userRoles[0]?.value ?? null) : null);

  const handleSubmit = () => {
    if (!role) return;

    grantAccessMutation
      .mutateAsync({ userId, roles: [{ role }] })
      .then(() => {
        toast.success(t('settings:users.grant_access.success'));
        onSuccess();
        revalidate();
      })
      .catch(() => {
        toast.error(t('common:errors.unknown'));
      });
  };

  return (
    <>
      <Modal.Title>{t('settings:users.grant_access.title')}</Modal.Title>
      <div className="p-lg">
        <UserRoleField value={role} onChange={setRole} userRoles={userRoles} access={access} />
      </div>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <Modal.FooterButton
          label={t('settings:users.grant_access.confirm')}
          onClick={handleSubmit}
          disabled={!role || grantAccessMutation.isPending}
          isLoading={grantAccessMutation.isPending}
        />
      </Modal.Footer>
    </>
  );
}
