import { LanguagePicker } from '@app-builder/routes/ressources+/user+/language';
import { segment } from '@app-builder/services/segment';
import { getFullName } from '@app-builder/services/user';
import { getRoute } from '@app-builder/utils/routes';
import * as Popover from '@radix-ui/react-popover';
import { Form } from '@remix-run/react';
import { t } from 'i18next';
import { Avatar, Button, Tag } from 'ui-design-system';
import { Icon, Logo } from 'ui-icons';

interface UserInfoProps {
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  orgOrPartnerName: string;
}

export function UserInfo({
  email,
  firstName,
  lastName,
  role,
  orgOrPartnerName,
}: UserInfoProps) {
  const fullName = getFullName({ firstName, lastName });
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="hover:bg-grey-05 active:bg-grey-10 group flex w-full flex-row items-center justify-between gap-2 overflow-hidden rounded-md p-2">
          <div className="inline-flex items-center gap-5">
            <Logo
              logo="logo"
              aria-labelledby="marble logo"
              className="size-6 shrink-0 transition-all group-aria-expanded/nav:size-12"
            />
            <Logo
              logo="marble"
              aria-labelledby="marble"
              className="h-6 w-full opacity-0 transition-opacity group-aria-expanded/nav:opacity-100"
            />
          </div>
          <Icon
            icon="arrow-2-down"
            className="group-radix-state-open:rotate-180 size-6 shrink-0 opacity-0 transition-opacity group-aria-expanded/nav:opacity-100"
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-grey-00 border-grey-10 animate-slideUpAndFade w-full max-w-xs rounded-md border border-solid p-6 drop-shadow-md will-change-auto"
          side="bottom"
          align="start"
          sideOffset={4}
        >
          <div className="flex flex-col items-center">
            {/* TODO(user): add more information when available */}
            <Avatar
              className="mb-2"
              size="xl"
              firstName={firstName}
              lastName={lastName}
              // src={user.profilePictureUrl}
            />
            {fullName ? (
              <p className="text-m mb-1 font-semibold capitalize">{fullName}</p>
            ) : null}
            <p className="text-s mb-2 font-normal">{email}</p>
            <Tag border="square">{role}</Tag>
            <p className="text-grey-50 m-2 text-xs font-normal">
              {orgOrPartnerName}
            </p>
            <LanguagePicker />
          </div>

          <div className="mt-6 flex flex-col items-center">
            <Form action={getRoute('/ressources/auth/logout')} method="POST">
              <Button
                variant="secondary"
                type="submit"
                onClick={() => {
                  void segment.reset();
                }}
              >
                <Icon icon="logout" className="size-5" />
                {t('common:auth.logout')}
              </Button>
            </Form>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
