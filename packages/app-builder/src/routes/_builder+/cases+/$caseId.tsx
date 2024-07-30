import {
  CopyToClipboardButton,
  ErrorComponent,
  Page,
} from '@app-builder/components';
import {
  CaseDecisions,
  CaseEvents,
  casesI18n,
} from '@app-builder/components/Cases';
import { CaseContributors } from '@app-builder/components/Cases/CaseContributors';
import { CaseFiles } from '@app-builder/components/Cases/CaseFiles';
import { isForbiddenHttpError, isNotFoundHttpError } from '@app-builder/models';
import { AddComment } from '@app-builder/routes/ressources+/cases+/add-comment';
import { EditCaseInbox } from '@app-builder/routes/ressources+/cases+/edit-inbox';
import { EditCaseName } from '@app-builder/routes/ressources+/cases+/edit-name';
import { EditCaseStatus } from '@app-builder/routes/ressources+/cases+/edit-status';
import { EditCaseTags } from '@app-builder/routes/ressources+/cases+/edit-tags';
import { UploadFile } from '@app-builder/routes/ressources+/cases+/upload-file';
import { serverServices } from '@app-builder/services/init.server';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import {
  isRouteErrorResponse,
  useLoaderData,
  useNavigate,
  useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'navigation', ...casesI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { user, cases, inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const caseId = fromParams(params, 'caseId');
  try {
    const caseDetail = await cases.getCase({ caseId });
    const currentInbox = await inbox.getInbox(caseDetail.inboxId);

    return json({ caseDetail, inbox: currentInbox, user });
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
  const { t } = useTranslation(handle.i18n);
  const { caseDetail, inbox, user } = useLoaderData<typeof loader>();
  const language = useFormatLanguage();

  return (
    <Page.Container>
      <Page.Header className="justify-between gap-8">
        <div className="flex flex-row items-center gap-4">
          <Page.BackButton />
          <span className="line-clamp-2 text-left">{caseDetail.name}</span>
          <CopyToClipboardButton toCopy={caseDetail.id}>
            <span className="text-s line-clamp-1 font-normal">
              <span className="font-medium">ID</span> {caseDetail.id}
            </span>
          </CopyToClipboardButton>
        </div>
        <EditCaseStatus caseId={caseDetail.id} status={caseDetail.status} />
      </Page.Header>
      <div className="flex size-full flex-row overflow-hidden">
        <div className="relative flex size-full flex-col overflow-hidden">
          <Page.Content>
            <CaseDecisions decisions={caseDetail.decisions} />
            <CaseFiles files={caseDetail.files} />
            <CaseEvents events={caseDetail.events} />
          </Page.Content>
          <div className="bg-grey-00 border-t-grey-10 flex shrink-0 flex-row items-center gap-4 border-t p-4">
            <AddComment caseId={caseDetail.id} />
            <UploadFile caseDetail={caseDetail}>
              <Button
                className="h-14 w-fit whitespace-nowrap"
                variant="secondary"
              >
                <Icon icon="attachment" className="size-5" />
                {t('cases:add_file')}
              </Button>
            </UploadFile>
          </div>
        </div>
        <div className="bg-grey-00 border-l-grey-10 flex h-full min-w-52 max-w-64 flex-col gap-4 border-l p-4">
          <EditCaseName caseId={caseDetail.id} name={caseDetail.name} />
          <div className="flex flex-col gap-2">
            <div className="text-s text-grey-25 capitalize">
              {t('cases:case.date')}
            </div>
            <time dateTime={caseDetail.createdAt}>
              {formatDateTime(caseDetail.createdAt, {
                language,
                timeStyle: undefined,
              })}
            </time>
          </div>
          <EditCaseInbox defaultInbox={inbox} caseId={caseDetail.id} />
          <EditCaseTags
            defaultCaseTagIds={caseDetail.tags.map(({ tagId }) => tagId)}
            caseId={caseDetail.id}
            user={user}
          />
          <div className="flex flex-col gap-2">
            <div className="text-s text-grey-25 capitalize">
              {t('cases:case.contributors')}
            </div>
            <CaseContributors contributors={caseDetail.contributors} />
          </div>
        </div>
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
