import { CustomLogo } from './CustomLogo';

interface UserInfoProps {
  isAutoAssignmentAvailable: boolean;
}

export function UserInfo({ isAutoAssignmentAvailable = false }: UserInfoProps) {
  return (
    <div className="relative">
      <div className="group flex w-full flex-row items-center justify-between gap-sm overflow-hidden rounded-md p-sm">
        <div className="inline-flex items-center gap-md">
          <CustomLogo
            logo="logo"
            alt="Logo"
            className="size-6 shrink-0 transition-all group-hover/sidebar:size-12 delay-400 group-hover/sidebar:delay-200 text-grey-primary"
            customLogoClassName="size-6 shrink-0 object-contain transition-all group-hover/sidebar:h-12 delay-400 group-hover/sidebar:delay-200 group-hover/sidebar:w-auto"
          />
          <CustomLogo
            logo="marble"
            alt="Logo"
            className="h-6 w-full opacity-0 transition-opacity group-hover/sidebar:opacity-100 delay-400 group-hover/sidebar:delay-200 dark:invert"
            hideWhenCustom
          />
        </div>
      </div>
    </div>
  );
}
