import {
  CopyToClipboardButton,
  DecisionDetail,
  DecisionRightPanel,
  decisionsI18n,
  ErrorComponent,
  OutcomePanel,
  Page,
  RulesDetail,
  useDecisionRightPanelContext,
} from '@app-builder/components';
import { ScorePanel } from '@app-builder/components/Decisions/Score';
import { TriggerObjectDetail } from '@app-builder/components/Decisions/TriggerObjectDetail';
import { isNotFoundHttpError } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { fromParams } from '@app-builder/utils/short-uuid';
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
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'navigation', ...decisionsI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
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
    <DecisionRightPanel.Root>
      <Page.Container>
        <Page.Header className="justify-between">
          <div className="flex flex-row items-center gap-4">
            <Link to="./..">
              <Page.BackButton />
            </Link>
            {t('decisions:decision')}
            <CopyToClipboardButton toCopy={decision.id}>
              <span className="text-s font-normal">
                <span className="font-medium">ID</span> {decision.id}
              </span>
            </CopyToClipboardButton>
          </div>
          {!decision.case ? <AddToCase decisionIds={[decision.id]} /> : null}
        </Page.Header>
        <Page.Content>
          <div className="grid grid-cols-[2fr_1fr] gap-4 lg:gap-6">
            <div className="flex flex-col gap-4 lg:gap-6">
              <DecisionDetail decision={decision} />
              <RulesDetail rules={decision.rules} />
            </div>
            <div className="flex flex-col gap-4 lg:gap-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
                <ScorePanel score={decision.score} />
                <OutcomePanel outcome={decision.outcome} />
              </div>
              <TriggerObjectDetail triggerObject={decision.trigger_object} />
            </div>
          </div>
        </Page.Content>
      </Page.Container>
    </DecisionRightPanel.Root>
  );
}

function AddToCase({ decisionIds }: { decisionIds: string[] }) {
  const { t } = useTranslation(decisionsI18n);
  const { onTriggerClick } = useDecisionRightPanelContext();
  return (
    <DecisionRightPanel.Trigger
      asChild
      onClick={() => {
        onTriggerClick({ decisionIds });
      }}
    >
      <Button>
        <Icon icon="plus" className="size-5" />
        {t('decisions:add_to_case')}
      </Button>
    </DecisionRightPanel.Trigger>
  );
}

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
