import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { LanguagePicker } from '@app-builder/components/LanguagePicker';
import { Outlet, useMatches } from '@remix-run/react';
import { cva } from 'class-variance-authority';
import { Logo } from 'ui-icons';

export type AuthPageHandle = {
  alignment?: 'reverse' | 'default';
};

export const handle = {
  i18n: authI18n,
};

const layoutClassName = cva('flex size-full bg-[#080525]', {
  variants: {
    alignment: {
      reverse: 'flex-row-reverse',
      default: null,
    },
  },
  defaultVariants: {
    alignment: 'default',
  },
});

export default function AuthLayout() {
  const matches = useMatches();
  const { alignment } = matches[matches.length - 1]?.handle as AuthPageHandle;

  return (
    <div className={layoutClassName({ alignment })}>
      <div className="flex flex-col grow gap-20 justify-center items-center p-[120px]">
        <Logo
          logo="logo-standard"
          className="text-grey-100 size-full h-16"
          preserveAspectRatio="xMinYMid meet"
          aria-labelledby="marble"
        />
        <div className="text-[40px] text-[#ADA7FD] font-medium text-center">
          Iterate. Improve. <span className="text-grey-100">Automate.</span>
        </div>
        <div className="aspect-342/198 w-full max-w-[600px]">
          <img src="/img/main-illu.svg" alt="main-illu" className="size-full" />
        </div>
      </div>
      <div className="relative bg-grey-100 basis-[600px] px-[120px] py-[124px] grid place-items-center">
        <div className="absolute bottom-6 right-6">
          <LanguagePicker />
        </div>
        <div className="min-h-[500px] w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
