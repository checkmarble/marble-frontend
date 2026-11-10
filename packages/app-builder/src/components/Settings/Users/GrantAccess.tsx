import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useGrantOrganizationAccessMutation } from '@app-builder/queries/settings/users/grant-organization-access';
import { roleBindingsSchema } from '@app-builder/schemas/settings';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Panel } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { type UserRoleOption, UserRoleSelector } from './UserRoleSelector';

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
    <Panel.Root open={open} onOpenChange={setOpen}>
      <Panel.Trigger asChild>
        <Button appearance="stroked" variant="primary" size="small">
          <Icon icon="plus" className="size-4" />
          {t('settings:users.grant_access.add')}
        </Button>
      </Panel.Trigger>
      <Panel.Container size="medium">
        <GrantAccessContent userId={userId} userRoles={userRoles} access={access} onSuccess={() => setOpen(false)} />
      </Panel.Container>
    </Panel.Root>
  );
}

function GrantAccessContent({ userId, userRoles, access, onSuccess }: GrantAccessProps & { onSuccess: () => void }) {
  const { t } = useTranslation(['common', 'settings']);
  const grantAccessMutation = useGrantOrganizationAccessMutation();
  const revalidate = useLoaderRevalidator();
  const [roles, setRoles] = useState([{ role: userRoles.length === 1 ? (userRoles[0]?.value ?? '') : '' }]);

  const handleSubmit = () => {
    if (!roleBindingsSchema.safeParse(roles).success) return;

    grantAccessMutation
      .mutateAsync({ userId, roles })
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
    <Panel.Content>
      <Panel.Header>{t('settings:users.grant_access.title')}</Panel.Header>
      <div className="py-lg">
        <UserRoleSelector roles={roles} onChange={setRoles} options={userRoles} access={access} />
      </div>
      <Panel.Footer>
        <Panel.FooterButton isCloseButton label={t('common:cancel')} />
        <Panel.FooterButton
          label={t('settings:users.grant_access.confirm')}
          onClick={handleSubmit}
          disabled={!roleBindingsSchema.safeParse(roles).success || grantAccessMutation.isPending}
          isLoading={grantAccessMutation.isPending}
        />
      </Panel.Footer>
    </Panel.Content>
  );
}
