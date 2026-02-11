import { Page } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { LanguagePicker } from '@app-builder/components/LanguagePicker';
import { useTheme } from '@app-builder/contexts/ThemeContext';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { segment } from '@app-builder/services/segment';
import { getFullName } from '@app-builder/services/user';
import { getRoute } from '@app-builder/utils/routes';
import { Form } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Switch, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['navigation', 'account', 'common'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);
      return (
        <BreadCrumbLink to={getRoute('/account')} isLast={isLast}>
          <Icon icon="user" className="me-2 size-6" />
          {t('navigation:my_account')}
        </BreadCrumbLink>
      );
    },
  ],
};

export default function AccountPage() {
  const { t } = useTranslation(handle.i18n);
  const { currentUser, org } = useOrganizationDetails();
  const { theme, toggleTheme } = useTheme();

  const { firstName, lastName, email } = currentUser.actorIdentity;
  const fullName = getFullName({ firstName, lastName });

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
        <Form action={getRoute('/ressources/auth/logout')} method="POST">
          <Button
            variant="secondary"
            type="submit"
            onClick={() => {
              void segment.reset();
            }}
          >
            {t('common:auth.logout')}
          </Button>
        </Form>
      </Page.Header>
      <Page.Container>
        <Page.Content>
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar size="xl" firstName={firstName} lastName={lastName} />
              {fullName ? <p className="text-xl font-semibold tracking-tight">{fullName}</p> : null}
              <div className="flex items-center gap-2">
                <Tag color="purple">{currentUser.role}</Tag>
                <Tag color="grey">{org.name}</Tag>
              </div>
              {email ? (
                <a href={`mailto:${email}`} className="text-s text-purple-primary font-medium underline">
                  {email}
                </a>
              ) : null}
            </div>

            <div className="bg-surface-card border-grey-border flex flex-col gap-6 rounded-lg border p-4">
              <div className="flex w-[272px] flex-col gap-2">
                <label className="text-s">{t('account:language')}</label>
                <LanguagePicker />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                <label className="text-s">{t('account:dark_mode')}</label>
              </div>
            </div>
          </div>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
