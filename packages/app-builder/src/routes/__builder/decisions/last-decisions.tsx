import { DecisionsList } from '@app-builder/components';
import { useDecisionsRightPanelState } from '@app-builder/routes/ressources/decisions/decision-detail.$decisionId';
import { serverServices } from '@app-builder/services/init.server';
import { useVisibilityChange } from '@app-builder/utils/hooks';
import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { Checkbox, Input } from '@ui-design-system';
import { Search } from '@ui-icons';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const decisions = apiClient.listDecisions();

  return json({
    decisions: await decisions,
  });
}

export default function LastDecisions() {
  const { decisionId, setDecisionId } = useDecisionsRightPanelState();

  const { decisions } = useLoaderData<typeof loader>();

  const { t } = useTranslation(['decisions']);

  return (
    <>
      <div className="my-2 flex flex-row justify-between gap-2">
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
      <DecisionsList
        decisions={decisions}
        selectedDecisionId={decisionId}
        onSelectDecision={setDecisionId}
      />
    </>
  );
}

function ToggleLiveUpdate() {
  const id = useId();
  const { t } = useTranslation(['decisions']);
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
      <label htmlFor={id} className="text-s whitespace-nowrap">
        {t('decisions:live_update')}
      </label>
    </div>
  );
}
