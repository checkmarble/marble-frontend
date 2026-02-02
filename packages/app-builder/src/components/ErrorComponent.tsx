import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { FORBIDDEN, NOT_FOUND } from '@app-builder/utils/http/http-status-codes';
import { isRouteErrorResponse } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ButtonV2 } from 'ui-design-system';

export const handle = {
  i18n: ['common'] satisfies Namespace,
};

export const ErrorComponent = ({ error }: { error: unknown }) => {
  const navigate = useAgnosticNavigation();
  const { t } = useTranslation(handle.i18n);

  const isDevMode = process.env.NODE_ENV === 'development';

  let title: string, subtitle: string | null;
  if (isRouteErrorResponse(error) && error.status === FORBIDDEN) {
    title = t('common:errors.forbidden.title');
    subtitle = t('common:errors.forbidden.subtitle');
  } else if (isRouteErrorResponse(error) && error.status === NOT_FOUND) {
    title = t('common:errors.not_found');
    subtitle = null;
  } else {
    title = t('common:error_boundary.default.title');
    subtitle = t('common:error_boundary.default.subtitle');
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-l text-purple-hover font-semibold">{title}</h1>
      {subtitle ? <p className="text-grey-primary text-s mb-6">{subtitle}</p> : null}

      <div className="mb-1">
        <ButtonV2 variant="primary" onClick={() => navigate(-1)}>
          {t('common:go_back')}
        </ButtonV2>
      </div>
      {isDevMode ? <ErrorDetail error={error} /> : null}
    </div>
  );
};

const ErrorDetail = ({ error }: { error: unknown }) => {
  if (isRouteErrorResponse(error)) {
    return (
      <div className="text-grey-primary text-xs">
        <p>
          Error status: {error.status} {error.statusText}
        </p>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className="text-grey-primary text-xs">
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1 className="text-grey-primary">Unknown Error</h1>;
  }
};
