import {
  Decisions,
  DecisionsList,
  ErrorComponent,
  Page,
  type ScenariosLinkProps,
} from '@app-builder/components';
import { ScheduledExecutionsList } from '@app-builder/components/ScheduledExecutionsList';
import { serverServices } from '@app-builder/services/init.server';
import { useVisibilityChange } from '@app-builder/utils/hooks';
import { Label } from '@radix-ui/react-label';
import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData, useRevalidator, useRouteError } from '@remix-run/react';
import { Checkbox, Input } from '@ui-design-system';
import { Decision as DecisionIcon, Search } from '@ui-icons';
import { type Namespace } from 'i18next';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DecisionsRightPanel,
  useDecisionsRightPanelState,
} from '../ressources/decisions/decision-detail.$decisionId';

export const handle = {
  i18n: ['decisions', 'scheduledExecution', 'navigation'] satisfies Namespace,
};

// export type ScenariosLinkProps = {
//   Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
//   labelTKey: ParseKeys<['scheduledExecution']>;
//   to: string;
// };

const LINKS: ScenariosLinkProps[] = [
  {
    labelTKey: 'navigation:scenario.decision',
    to: './decisions',
    Icon: DecisionIcon,
  },
  {
    labelTKey: 'navigation:scheduledExecution',
    to: './scheduled_executions',
    Icon: DecisionIcon,
  },
];

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient, backendInfo } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: '/login',
    }
  );

  const decisions = apiClient.listDecisions();
  const scheduledExecutions = apiClient.listScheduledExecutions({
    scenarioId: '',
  });

  return json({
    decisions: await decisions,
    scheduledExecutions: (await scheduledExecutions).scheduled_executions,
    backendInfo,
  });
}

export default function DecisionsPage() {
  const { decisionId, setDecisionId } = useDecisionsRightPanelState();

  const { decisions, scheduledExecutions, backendInfo } =
    useLoaderData<typeof loader>();

  const { t } = useTranslation(handle.i18n);

  return (
    <Page.Container>
      <Page.Header>
        <DecisionIcon className="mr-2" height="24px" width="24px" />
        {t('navigation:decisions')}
      </Page.Header>

      <Decisions.Nav>
        {LINKS.map((linkProps) => (
          <li key={linkProps.labelTKey}>
            <Decisions.Link {...linkProps} />
          </li>
        ))}
      </Decisions.Nav>

      <DecisionsRightPanel.Root>
        <Page.Content scrollable={false}>
          <div className="flex flex-row justify-between gap-2">
            <Input
              className="w-full max-w-sm"
              type="search"
              aria-label={t('decisions:search.placeholder')}
              placeholder={t('decisions:search.placeholder')}
              startAdornment={<Search />}
              value={decisionId ?? ''}
              onKeyDownCapture={(e) => {
                if (e.code === 'Escape') {
                  setDecisionId();
                }
              }}
              onChange={(event) => {
                setDecisionId(event.target.value);
              }}
              onClick={(e) => {
                e.stopPropagation(); // To prevent DecisionsRightPanel from closing
              }}
            />
            <ToggleLiveUpdate />
          </div>
          <ScheduledExecutionsList scheduledExecutions={scheduledExecutions} />
          <DecisionsList
            decisions={decisions}
            selectedDecisionId={decisionId}
            onSelectDecision={setDecisionId}
          />
        </Page.Content>
      </DecisionsRightPanel.Root>
    </Page.Container>
  );
}

function ToggleLiveUpdate() {
  const id = useId();
  const { t } = useTranslation(handle.i18n);
  const revalidator = useRevalidator();
  const [liveUpdate, setLiveUpdate] = useState(false);
  const visibilityState = useVisibilityChange();

  useEffect(() => {
    if (!liveUpdate || visibilityState === 'hidden') return;

    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [liveUpdate, revalidator, visibilityState]);

  return (
    <div className="flex flex-row items-center gap-2">
      <Checkbox
        id={id}
        onCheckedChange={(checked) => {
          if (checked === 'indeterminate') return;
          setLiveUpdate(checked);
        }}
      />
      <Label htmlFor={id} className="text-s whitespace-nowrap">
        {t('decisions:live_update')}
      </Label>
    </div>
  );
}

export function ErrorBoundary() {
  return <ErrorComponent error={useRouteError()} />;
}
