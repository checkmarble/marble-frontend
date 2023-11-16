import {
  CopyToClipboardButton,
  ErrorComponent,
  Page,
} from '@app-builder/components';
import { isNotFoundHttpError } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { fromParams } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs } from '@remix-run/node';
import {
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useNavigate,
  useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const caseId = fromParams(params, 'caseId');
  try {
    const caseDetail = await apiClient.getCase(caseId);

    return json({ caseDetail });
  } catch (error) {
    if (isNotFoundHttpError(error)) {
      throw new Response(null, { status: 404, statusText: 'Not Found' });
    } else {
      throw error;
    }
  }
}

export default function CasePage() {
  const { caseDetail } = useLoaderData<typeof loader>();
  return (
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center gap-2">
          <Link to="./..">
            <Page.BackButton />
          </Link>
          {caseDetail.name}
          <CopyToClipboardButton toCopy={caseDetail.id}>
            <span className="text-s font-normal">
              <span className="font-medium">ID</span> {caseDetail.id}
            </span>
          </CopyToClipboardButton>
        </div>
      </Page.Header>
      <Page.Content>TODO</Page.Content>
    </Page.Container>
  );
}

const CaseNotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  return (
    <div className="m-auto flex flex-col items-center gap-4">
      {t('common:errors.not_found')}
      <div className="mb-1">
        <Button onClick={() => navigate(-1)}>{t('common:go_back')}</Button>
      </div>
    </div>
  );
};

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <CaseNotFound />;
  }

  return <ErrorComponent error={error} />;
}
