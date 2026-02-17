import { useUnavailabilitySettings } from '@app-builder/queries/personal-settings';

import { CustomLogo } from './CustomLogo';

interface UserInfoProps {
  isAutoAssignmentAvailable: boolean;
}

export function UserInfo({ isAutoAssignmentAvailable = false }: UserInfoProps) {
  const { query: unavailabilityQuery } = useUnavailabilitySettings();

  return (
    <div className="relative">
      <div className="group flex w-full flex-row items-center justify-between gap-2 overflow-hidden rounded-md p-2">
        <div className="inline-flex items-center gap-5">
          <CustomLogo
            logo="logo"
            alt="Logo"
            className="size-6 shrink-0 transition-all group-aria-expanded/nav:size-12 text-grey-primary"
            customLogoClassName="size-6 shrink-0 object-contain transition-all group-aria-expanded/nav:h-12 group-aria-expanded/nav:w-auto"
          />
          {isAutoAssignmentAvailable && unavailabilityQuery.isSuccess && unavailabilityQuery.data.until !== null ? (
            <div className="absolute top-1 left-1 flex h-3 w-3">
              <span className="animate-[ping_1s_ease-in-out_4s] absolute inline-flex h-full w-full rounded-full bg-red-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-primary"></span>
            </div>
          ) : null}
          <CustomLogo
            logo="marble"
            alt="Logo"
            className="h-6 w-full opacity-0 transition-opacity group-aria-expanded/nav:opacity-100 dark:invert"
            hideWhenCustom
          />
        </div>
      </div>
    </div>
  );
}
