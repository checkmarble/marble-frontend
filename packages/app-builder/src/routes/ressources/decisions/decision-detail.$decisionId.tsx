import {
  createRightPanel,
  Outcome,
  type RightPanelRootProps,
} from '@app-builder/components';
import { authenticator } from '@app-builder/services/auth/auth.server';
import { getRoute } from '@app-builder/services/routes';
import { formatCreatedAt } from '@app-builder/utils/format';
import { parseParams } from '@app-builder/utils/input-validation';
import { json, type LoaderArgs, type SerializeFrom } from '@remix-run/node';
import { useFetcher, useSearchParams } from '@remix-run/react';
import { Decision as DecisionIcon } from '@ui-icons';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { JsonView } from 'react-json-view-lite';
import * as z from 'zod';

export const handle = {
  i18n: ['decisions', 'common'] satisfies Namespace,
};

const formSchema = z.object({
  decisionId: z.string().uuid(),
});

export async function loader({ request, params }: LoaderArgs) {
  const { apiClient } = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  try {
    const { decisionId } = await parseParams(params, formSchema);
    const decision = await apiClient.getDecision(decisionId);

    return json({
      success: true as const,
      decision,
    });
  } catch (error) {
    return json({
      success: false as const,
      decision: null,
    });
  }
}

const { RightPanel } = createRightPanel('DecisionsRightPanel');

function DecisionsRightPanelRoot({
  children,
  ...props
}: Omit<RightPanelRootProps, 'open' | 'onClose'>) {
  const { load, data } = useFetcher<typeof loader>();
  const { decisionId, setDecisionId } = useDecisionsRightPanelState();

  useEffect(() => {
    if (decisionId) {
      load(
        getRoute('/ressources/decisions/decision-detail/:decisionId', {
          decisionId,
        })
      );
    }
  }, [decisionId, load]);

  const open = !!decisionId;

  const title = data?.decision?.id ?? decisionId;

  return (
    <RightPanel.Root
      {...props}
      open={open}
      onClose={() => {
        setDecisionId();
      }}
      className="overflow-hidden"
    >
      <RightPanel.Viewport>{children}</RightPanel.Viewport>
      <RightPanel.Content
        className="max-w-xl lg:max-w-2xl"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <RightPanel.Title>
          <DecisionIcon height="24px" width="24px" />
          <span className="w-full">{title}</span>
          <RightPanel.Close />
        </RightPanel.Title>
        {data ? <DecisionDetail data={data} /> : <DecisionDetailLoading />}
      </RightPanel.Content>
    </RightPanel.Root>
  );
}

function Card({
  className,
  ...otherProps
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <div
      className={clsx(
        'border-grey-10 w-full flex-shrink-0 items-center gap-x-1 gap-y-2 rounded border',
        className
      )}
      {...otherProps}
    />
  );
}

function DecisionDetailLoading() {
  const { t } = useTranslation(handle.i18n);
  return (
    <Card className="grid grid-cols-[repeat(1,max-content)] overflow-hidden  p-4">
      <p className="font-light">{t('decisions:scenario.name')}:</p>
      <p className="font-light">{t('decisions:score')}:</p>
      <p className="font-light">{t('decisions:outcome')}:</p>
      <p className="font-light">{t('decisions:created_at')}:</p>
    </Card>
  );
}

function DecisionDetail({ data }: { data: SerializeFrom<typeof loader> }) {
  const { t, i18n } = useTranslation(handle.i18n);

  if (data.success) {
    const decision = data.decision;
    return (
      <>
        <Card className="grid grid-cols-[repeat(2,max-content)] overflow-hidden p-4">
          <p className="font-light">{t('decisions:scenario.name')}:</p>
          <p className="font-normal">
            <Trans
              t={t}
              i18nKey="decisions:detail.scenario_name_runs_on"
              components={{
                ScenarioName: <span className="font-medium" />,
                TriggerObjectType: <span className="font-medium" />,
              }}
              values={{
                scenarioName: decision?.scenario.name,
                triggerObjectType: decision.trigger_object_type,
              }}
            />
          </p>
          <p className="font-light">{t('decisions:score')}:</p>
          <p className="font-medium">{decision?.score}</p>
          <p className="font-light">{t('decisions:outcome')}:</p>
          <Outcome
            className="w-fit"
            border="square"
            size="small"
            outcome={decision.outcome}
          />
          <p className="font-light">{t('decisions:created_at')}:</p>
          <p className="font-medium">
            {formatCreatedAt(i18n.language, decision.created_at)}
          </p>
        </Card>
        <div className="flex overflow-hidden">
          <Card className="overflow-auto">
            <JsonView
              data={decision}
              style={{
                container:
                  'whitespace-pre-wrap break-words my-4 text-grey-100 font-light',
                basicChildStyle: 'p-0 my-0 mx-4',
                label: 'font-semibold mr-1',
                nullValue: 'text-red-100',
                undefinedValue: 'text-red-100',
                stringValue: 'text-grey-100 font-light',
                booleanValue: 'text-green-100',
                numberValue: 'text-blue-100',
                otherValue: 'text-grey-50',
                expander: 'mr-1 select-none text-l',
                punctuation: 'mr-1 font-bold',
                pointer: 'cursor-pointer',
              }}
            />
          </Card>
        </div>
      </>
    );
  }

  return (
    <Card className="p-4">
      <p>{t('decisions:detail.error')}</p>
    </Card>
  );
}

export const DecisionsRightPanel = {
  Root: DecisionsRightPanelRoot,
  Trigger: RightPanel.Trigger,
};

export function useDecisionsRightPanelState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const decisionId = searchParams.get('decisionId');

  const setDecisionId = (decisionId?: string) => {
    setSearchParams((prev) => {
      if (decisionId) {
        prev.set('decisionId', decisionId);
      } else {
        prev.delete('decisionId');
      }
      return prev;
    });
  };

  return {
    decisionId,
    setDecisionId,
  };
}
