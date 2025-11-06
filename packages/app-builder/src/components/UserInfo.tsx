import { useUnavailabilitySettings } from '@app-builder/queries/personal-settings';
import { segment } from '@app-builder/services/segment';
import { getFullName } from '@app-builder/services/user';
import { getRoute } from '@app-builder/utils/routes';
import * as Popover from '@radix-ui/react-popover';
import { Form } from '@remix-run/react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Tag } from 'ui-design-system';
import { Icon, Logo } from 'ui-icons';
import { LanguagePicker } from './LanguagePicker';
import { UserAvailabilityStatus } from './Settings/UserAvailabilityStatus';

interface UserInfoProps {
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  orgName: string;
  isAutoAssignmentAvailable: boolean;
}

export function UserInfo({
  email,
  firstName,
  lastName,
  role,
  orgName,
  isAutoAssignmentAvailable = false,
}: UserInfoProps) {
  const { t } = useTranslation(['common']);
  const fullName = getFullName({ firstName, lastName });
  const { query: unavailabilityQuery } = useUnavailabilitySettings();
  const queryClient = useQueryClient();

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <div className="relative">
          <button className="hover:bg-grey-95 active:bg-grey-90 group flex w-full flex-row items-center justify-between gap-2 overflow-hidden rounded-md p-2">
            <div className="inline-flex items-center gap-5">
              <Logo
                logo="logo"
                aria-labelledby="marble logo"
                className="size-6 shrink-0 transition-all group-aria-expanded/nav:size-12"
              />
              {isAutoAssignmentAvailable &&
              unavailabilityQuery.isSuccess &&
              unavailabilityQuery.data.until !== null ? (
                <div className="absolute top-1 left-1 flex h-3 w-3">
                  <span className="animate-[ping_1s_ease-in-out_4s] absolute inline-flex h-full w-full rounded-full bg-red-47 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-47"></span>
                </div>
              ) : null}
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
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-grey-100 border-grey-90 animate-slide-up-and-fade z-50 w-full max-w-xs rounded-md border border-solid p-6 drop-shadow-md will-change-auto min-w-64"
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
            {fullName ? <p className="text-m mb-1 font-semibold capitalize">{fullName}</p> : null}
            <p className="text-s mb-2 font-normal">{email}</p>
            <Tag border="square">{role}</Tag>
            <p className="text-grey-50 m-2 text-xs font-normal">{orgName}</p>
            <LanguagePicker />
          </div>

          <div className="mt-6 flex flex-col items-center gap-10">
            <UserAvailabilityStatus {...{ isAutoAssignmentAvailable }} />

            <Form action={getRoute('/ressources/auth/logout')} method="POST">
              <Button
                variant="secondary"
                type="submit"
                onClick={() => {
                  queryClient.invalidateQueries();
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
