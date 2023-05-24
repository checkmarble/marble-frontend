import { type Decision } from '@marble-front/api/marble';
import {
  createRightPannel,
  Outcome,
  type RightPannelRootProps,
} from '@marble-front/builder/components';
import { getDecision } from '@marble-front/builder/fixtures';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { getRoute } from '@marble-front/builder/services/routes';
import { formatCreatedAt } from '@marble-front/builder/utils/format';
import { parseParams } from '@marble-front/builder/utils/input-validation';
import { Decision as DecisionIcon } from '@marble-front/ui/icons';
import { json, type LoaderArgs } from '@remix-run/node';
import { useFetcher, useSearchParams } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { defaultStyles, JsonView } from 'react-json-view-lite';
import * as z from 'zod';

export const handle = {
  i18n: ['decisions', 'common'] satisfies Namespace,
};

const formSchema = z.object({
  decisionId: z.string().uuid(),
});

export async function loader({ request, params }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  try {
    const { decisionId } = await parseParams(params, formSchema);
    const decision = await getDecision(decisionId);

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

const { RightPannel } = createRightPannel('DecisionsRightPannel');

function DecisionsRightPannelRoot({
  children,
  ...props
}: Omit<RightPannelRootProps, 'open' | 'onClose'>) {
  const { load, data } = useFetcher<typeof loader>();
  const { decisionId, setDecisionId } = useDecisionsRightPannelState();

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

  return (
    <RightPannel.Root
      {...props}
      open={open}
      onClose={() => {
        setDecisionId();
      }}
      className="overflow-hidden"
    >
      <RightPannel.Viewport>{children}</RightPannel.Viewport>
      <RightPannel.Content className="max-w-xl lg:max-w-2xl">
        <RightPannel.Title>
          <DecisionIcon height="24px" width="24px" />
          <span className="w-full capitalize">
            {data?.decision?.id ?? decisionId}
          </span>
          <RightPannel.Close />
        </RightPannel.Title>
        <DecisionDetail decision={data?.decision} />
      </RightPannel.Content>
    </RightPannel.Root>
  );
}

function DecisionDetail({ decision }: { decision?: Decision | null }) {
  const { t, i18n } = useTranslation(handle.i18n);

  if (!decision) return null;

  return (
    <>
      <div className="border-grey-10 grid flex-shrink-0 grid-cols-[repeat(2,max-content)] items-center gap-y-2 gap-x-1 overflow-hidden rounded border p-4">
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
      </div>
      <div className="flex overflow-auto">
        <div className="border-grey-10 relative w-full overflow-auto rounded border">
          <JsonView
            data={decision}
            style={{
              ...defaultStyles,
              container: 'p-4',
            }}
          />
        </div>
      </div>
    </>
  );
}

export const DecisionsRightPannel = {
  Root: DecisionsRightPannelRoot,
  Trigger: RightPannel.Trigger,
};

export function useDecisionsRightPannelState() {
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
