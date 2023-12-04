import { isRouteErrorResponse, useNavigate } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';

export const handle = {
  i18n: ['common'] satisfies Namespace,
};

export const ErrorComponent = ({ error }: { error: unknown }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(handle.i18n);

  // eslint-disable-next-line no-restricted-properties
  const isDevMode = process.env.NODE_ENV === 'development';

  return (
    <div className="m-auto flex flex-col items-center gap-4">
      <h1 className="text-l text-purple-110 font-semibold">
        {t('common:error_boundary.default.title')}
      </h1>
      <p className="text-s mb-6">
        {t('common:error_boundary.default.subtitle')}
      </p>

      <div className="mb-1">
        <Button onClick={() => navigate(-1)}>{t('common:go_back')}</Button>
      </div>
      {isDevMode ? <ErrorDetail error={error} /> : null}
    </div>
  );
};

const ErrorDetail = ({ error }: { error: unknown }) => {
  if (isRouteErrorResponse(error)) {
    return (
      <div className="text-xs">
        <p>
          Error status: {error.status} {error.statusText}
        </p>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className="text-xs">
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
};
