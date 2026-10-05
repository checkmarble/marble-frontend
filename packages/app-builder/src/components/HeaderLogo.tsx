import { CustomLogo } from './CustomLogo';

export function HeaderLogo() {
  return (
    <div className="relative">
      <div className="group flex w-full flex-row items-center justify-between gap-sm overflow-hidden rounded-md p-sm">
        <div className="inline-flex items-center gap-md">
          <CustomLogo
            logo="logo"
            alt="Logo"
            className="size-6 shrink-0 transition-all group-sidebar-open:size-12 delay-400 group-sidebar-open:delay-200 text-grey-primary"
            customLogoClassName="size-8 shrink-0 object-contain transition-all group-sidebar-open:size-14 delay-400 group-sidebar-open:delay-200"
          />
          <CustomLogo
            logo="marble"
            alt="Logo"
            className="h-6 w-full opacity-0 transition-opacity group-sidebar-open:opacity-100 delay-400 group-sidebar-open:delay-200 dark:invert"
            hideWhenCustom
          />
        </div>
      </div>
    </div>
  );
}
