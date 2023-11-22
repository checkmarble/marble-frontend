import {
  CopyToClipboardButton,
  ErrorComponent,
  Page,
} from '@app-builder/components';
import {
  CaseDecisions,
  CaseInformation,
  casesI18n,
} from '@app-builder/components/Cases';
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
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';

export const handle = {
  i18n: ['common', 'navigation', ...casesI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const caseId = fromParams(params, 'caseId');
  try {
    const caseDetail = await cases.getCase({ caseId });

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
      <Page.Content>
        <div className="grid grid-cols-[2fr_1fr] gap-4 lg:gap-8">
          <div className="flex flex-col gap-4 lg:gap-8">
            <CaseInformation caseDetail={caseDetail} />
            <CaseDecisions decisions={caseDetail.decisions} />
          </div>
          <div className="flex flex-col gap-4 lg:gap-8"></div>
        </div>
      </Page.Content>
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
