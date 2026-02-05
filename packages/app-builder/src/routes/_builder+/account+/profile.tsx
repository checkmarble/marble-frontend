import { Page } from '@app-builder/components';
import { initServerServices } from '@app-builder/services/init.server';
import { getFullName } from '@app-builder/services/user';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Avatar, Tag } from 'ui-design-system';

export const handle = {
  i18n: ['account'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { user, organization } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const organizationDetail = await organization.getCurrentOrganization();

  return {
    user,
    organization: organizationDetail,
  };
}

export default function AccountProfile() {
  const { t } = useTranslation(handle.i18n);
  const { user, organization } = useLoaderData<typeof loader>();
  const fullName = getFullName({
    firstName: user.actorIdentity.firstName,
    lastName: user.actorIdentity.lastName,
  });

  return (
    <Page.Container>
      <Page.ContentV2 className="max-w-2xl">
        <div className="flex flex-col gap-6">
          <h1 className="text-l font-semibold">{t('account:profile')}</h1>

          <div className="bg-surface-card border-grey-border rounded-lg border p-6">
            <div className="flex items-start gap-6">
              <Avatar size="xl" firstName={user.actorIdentity.firstName} lastName={user.actorIdentity.lastName} />
              <div className="flex flex-col gap-2">
                {fullName ? <p className="text-l font-semibold capitalize">{fullName}</p> : null}
                <p className="text-s text-grey-secondary">{user.actorIdentity.email}</p>
                <div className="flex items-center gap-2">
                  <Tag border="square">{user.role}</Tag>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-card border-grey-border rounded-lg border p-6">
            <h2 className="text-m font-semibold mb-4">{t('account:organization')}</h2>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-s text-grey-secondary">{t('account:organization_name')}</span>
                <span className="text-s font-medium">{organization.name}</span>
              </div>
            </div>
          </div>
        </div>
      </Page.ContentV2>
    </Page.Container>
  );
}
