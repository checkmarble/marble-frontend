import { ErrorComponent } from '@app-builder/components';
import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { isAnalyst } from '@app-builder/models';
import { logoutFn } from '@app-builder/server-fns/auth';
import { segment } from '@app-builder/services/segment';
import { FORBIDDEN } from '@app-builder/utils/http/http-status-codes';
import * as Sentry from '@sentry/tanstackstart-react';
import { createFileRoute, isRedirect, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { authMiddleware } from '../middlewares/auth-middleware';

const appRouterLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function appRouterLoader({ context }) {
    if (isAnalyst(context.authInfo.user)) {
      throw redirect({ to: '/cases' });
    }

    const dataModel = await context.authInfo.dataModelRepository.getDataModel();
    if (dataModel.length === 0) {
      throw redirect({ to: '/data/list' });
    }

    throw redirect({ to: '/detection' });
  });

export const Route = createFileRoute('/app-router')({
  loader: () => appRouterLoader(),
  errorComponent: AppRouterError,
});

function AppRouterError({ error }: { error: unknown }) {
  const { t } = useTranslation(authI18n);

  let errorComponent;
  if (error instanceof Response && error.status === FORBIDDEN) {
    errorComponent = (
      <div className="m-auto flex flex-col items-center gap-4">
        <h1 className="text-l text-purple-hover font-semibold">{t('common:error_boundary.marble_admin.title')}</h1>
        <p className="text-s mb-6">{t('common:error_boundary.marble_admin.subtitle')}</p>
        <div className="mb-1">
          <Button
            variant="primary"
            onClick={() => {
              void segment.reset();
              void logoutFn({ data: {} });
            }}
          >
            <Icon icon="logout" className="size-5" />
            {t('common:auth.logout')}
          </Button>
        </div>
      </div>
    );
  } else if (!isRedirect(error)) {
    Sentry.captureException(error);
    errorComponent = <ErrorComponent error={error} />;
  }

  return (
    <div className="bg-purple-background-light flex size-full items-center justify-center">
      <div className="bg-surface-card flex max-w-md rounded-2xl p-10 shadow-md">{errorComponent}</div>
    </div>
  );
}
