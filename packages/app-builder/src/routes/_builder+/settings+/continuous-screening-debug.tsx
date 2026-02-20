import { ContinuousScreeningDebugPage } from '@app-builder/components/Settings/ContinuousScreeningDebug/ContinuousScreeningDebugPage';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { redirect, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import QueryString from 'qs';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
  BreadCrumb: function ContinuousScreeningDebugBreadcrumb() {
    const { t } = useTranslation(['settings']);
    return <span>{t('settings:continuous_screening_debug')}</span>;
  },
};

const DEFAULT_LIMIT = 25;

const pageQueryStringSchema = z.object({
  limit: z.coerce.number().optional().default(DEFAULT_LIMIT),
});

export const loader = createServerFn(
  [authMiddleware],
  async function continuousScreeningDebugLoader({ context, request }) {
    const { user } = context.authInfo;

    if (!isAdmin(user)) {
      return redirect(getRoute('/'));
    }

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const parsedSearchParams = pageQueryStringSchema.parse(Object.fromEntries(searchParams));

    return {
      limit: parsedSearchParams.limit,
    };
  },
);

export default function ContinuousScreeningDebug() {
  const navigate = useAgnosticNavigation();
  const { limit } = useLoaderData<typeof loader>();

  const updatePage = (newLimit: number) => {
    const qs = QueryString.stringify(
      {
        limit: newLimit !== DEFAULT_LIMIT ? newLimit : undefined,
      },
      { addQueryPrefix: true, skipNulls: true },
    );
    navigate({ search: qs }, { replace: true });
  };

  return <ContinuousScreeningDebugPage limit={limit} updatePage={updatePage} />;
}
