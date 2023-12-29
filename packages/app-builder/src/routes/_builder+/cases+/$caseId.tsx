import {
  CopyToClipboardButton,
  ErrorComponent,
  Page,
} from '@app-builder/components';
import {
  CaseDecisions,
  CaseEvents,
  CaseInformation,
  casesI18n,
} from '@app-builder/components/Cases';
import { CaseFiles } from '@app-builder/components/Cases/CaseFiles';
import { isForbiddenHttpError, isNotFoundHttpError } from '@app-builder/models';
import { AddComment } from '@app-builder/routes/ressources+/cases+/add-comment';
import { EditCaseStatus } from '@app-builder/routes/ressources+/cases+/edit-status';
import { UploadFile } from '@app-builder/routes/ressources+/cases+/upload-file';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
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
  i18n: ['common', 'navigation', 'cases', ...casesI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { user, cases, apiClient } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: '/login',
    },
  );

  const caseId = fromParams(params, 'caseId');
  try {
    const caseDetail = await cases.getCase({ caseId });
    const { inbox } = await apiClient.getInbox(caseDetail.inbox_id);

    return json({ caseDetail, inbox, user });
  } catch (error) {
    // On purpusely catch 403 errors to display a 404 page
    if (isNotFoundHttpError(error) || isForbiddenHttpError(error)) {
      throw new Response(null, { status: 404, statusText: 'Not Found' });
    } else {
      throw error;
    }
  }
}

export default function CasePage() {
  const { caseDetail, inbox, user } = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Link
            to={getRoute('/cases/inboxes/:inboxId', {
              inboxId: fromUUID(caseDetail.inbox_id),
            })}
          >
            <Page.BackButton />
          </Link>
          {caseDetail.name}
          <CopyToClipboardButton toCopy={caseDetail.id}>
            <span className="text-s font-normal">
              <span className="font-medium">ID</span> {caseDetail.id}
            </span>
          </CopyToClipboardButton>
        </div>
        <EditCaseStatus caseId={caseDetail.id} status={caseDetail.status} />
      </Page.Header>
      <Page.Content>
        <div className="grid grid-cols-[2fr_1fr] gap-4 lg:gap-6">
          <div className="flex flex-col gap-4 lg:gap-6">
            <CaseInformation
              caseDetail={caseDetail}
              inbox={inbox}
              user={user}
            />
            <CaseDecisions decisions={caseDetail.decisions} />
            <CaseFiles files={caseDetail.files} />
          </div>
          <div className="flex flex-col gap-4 lg:gap-6">
            <CaseEvents events={caseDetail.events} />
          </div>
        </div>
      </Page.Content>
      <div className="bg-grey-00 border-t-grey-10 sticky inset-x-0 bottom-0 flex flex-row gap-4 border-t p-4">
        <AddComment caseId={caseDetail.id} />
        <UploadFile caseDetail={caseDetail} />
      </div>
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
