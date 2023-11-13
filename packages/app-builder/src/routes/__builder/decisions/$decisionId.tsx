import {
  DecisionDetail,
  decisionsI18n,
  ErrorComponent,
  OutcomePanel,
  Page,
  RulesDetail,
} from '@app-builder/components';
import { ScorePanel } from '@app-builder/components/Decisions/Score';
import { TriggerObjectDetail } from '@app-builder/components/Decisions/TriggerObjectDetail';
import { isNotFoundHttpError } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { fromParams } from '@app-builder/utils/short-uuid';
import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
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
import { Duplicate } from 'ui-icons';

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const decisionId = fromParams(params, 'decisionId');
  try {
    const decision = await apiClient.getDecision(decisionId);

    return json({ decision });
  } catch (error) {
    if (isNotFoundHttpError(error)) {
      throw new Response(null, { status: 404, statusText: 'Not Found' });
    } else {
      throw error;
    }
  }
}

export default function DecisionPage() {
  const { decision } = useLoaderData<typeof loader>();
  const { t } = useTranslation(decisionsI18n);
  return (
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center gap-2">
          <Link to="./..">
            <Page.BackButton />
          </Link>
          {t('decisions:decision')}
          <CopyToClipboardButton decisionId={decision.id} />
        </div>
        {/* <Button>
          <Plus />
          {t('decisions:add_to_case')}
        </Button> */}
      </Page.Header>
      <Page.Content>
        <div className="grid grid-cols-[2fr_1fr] gap-8">
          <div className="flex flex-col gap-8">
            <div className="flex gap-8">
              <ScorePanel score={decision.score} />
              <OutcomePanel outcome={decision.outcome} />
            </div>
            <DecisionDetail decision={decision} />
            <RulesDetail rules={decision.rules} />
          </div>
          <TriggerObjectDetail triggerObject={decision.trigger_object} />
        </div>
      </Page.Content>
    </Page.Container>
  );
}

const CopyToClipboardButton = ({
  decisionId,
  ...props
}: {
  decisionId: string;
}) => {
  const getCopyToClipboardProps = useGetCopyToClipboard();
  return (
    <div
      className="border-grey-10 text-s flex cursor-pointer select-none items-center gap-1 rounded border p-2 font-normal"
      {...getCopyToClipboardProps(decisionId)}
      {...props}
    >
      ID {decisionId}
      <Duplicate />
    </div>
  );
};

const DecisionNotFound = () => {
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
    return <DecisionNotFound />;
  }

  return <ErrorComponent error={error} />;
}
