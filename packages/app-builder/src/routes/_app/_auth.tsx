import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { LanguagePicker } from '@app-builder/components/LanguagePicker';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Outlet, useMatches } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { useEffect } from 'react';
import { Logo } from 'ui-icons';

export type AuthPageHandle = {
  alignment?: 'reverse' | 'default';
};

const layoutClassName = cva('flex h-dvh bg-[#080525] relative isolate overflow-hidden', {
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

export const Route = createFileRoute('/_app/_auth')({
  staticData: {
    i18n: authI18n,
  },
  beforeLoad: async ({ context }) => {
    await context.i18n.loadNamespaces(['common', 'auth']);
  },
  component: AuthLayout,
});

function AuthLayout() {
  const matches = useMatches();
  const { alignment } = (matches[matches.length - 1]?.staticData as AuthPageHandle) ?? {};
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.resetQueries();
  }, []);

  return (
    <div className={layoutClassName({ alignment })}>
      <Logo logo="m" className="absolute inset-[-10vw] size-[120vw] rotate-30 opacity-50 -z-10" />
      <div className="hidden lg:grid place-content-center-safe gap-20 p-50 w-full">
        <Logo
          logo="logo-standard"
          className="text-grey-white size-full h-16"
          preserveAspectRatio="xMinYMid meet"
          aria-labelledby="marble"
        />
        <div className="text-[40px] text-[#ADA7FD] font-medium text-center">
          Iterate. Improve. <span className="text-grey-white">Automate.</span>
        </div>
        <div className="aspect-342/198 w-full max-w-150">
          <img src="/img/main-illu.svg" alt="main-illu" className="size-full" />
        </div>
      </div>
      <div className="static right-0 top-0 bottom-0 lg:min-w-[min(33%,600px)] min-w-full min-h-0 overflow-y-auto bg-surface-card p-5 grid grid-rows-[1fr_auto] place-items-center">
        <div>
          <Logo
            logo="logo-standard"
            className="text-grey-primary size-full h-16 block lg:hidden mb-20"
            preserveAspectRatio="xMinYMid meet"
            aria-labelledby="marble"
          />
          <div className="min-h-125 w-full">
            <Outlet />
          </div>
        </div>
        <div className="ms-auto">
          <LanguagePicker />
        </div>
      </div>
    </div>
  );
}
