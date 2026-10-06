import { useUserPreferencesUpdater } from '@bo/hooks/useUserPreferencesUpdater';
import type { DashboardPreferencesPatch } from '@bo/schemas/dashboard';
import {
  type DashboardPreferences,
  getDashboardPreferences,
  patchDashboardPreferences,
} from '@bo/utils/dashboard-preferences';
import { getRouteApi, useRouter } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useDashboardPreferences(): {
  preferences: DashboardPreferences;
  updatePreferences: (patch: DashboardPreferencesPatch) => Promise<void>;
} {
  const { userPreferences } = getRouteApi('__root__').useRouteContext();
  const { currentUser } = getRouteApi('/_app/_private').useLoaderData();
  const userId = currentUser.actor_identity.user_id;
  const initial = getDashboardPreferences(userPreferences.dashboard, userId);
  const [selection, setSelection] = useState({ userId, preferences: initial });
  const currentAccount = useRef(userId);
  currentAccount.current = userId;
  const confirmed = useRef(initial);
  const pending = useRef<DashboardPreferencesPatch[]>([]);
  const { updateDashboard } = useUserPreferencesUpdater();
  const router = useRouter();

  useEffect(() => {
    if (pending.current.length && selection.userId === userId) return;
    if (selection.userId !== userId) pending.current = [];
    const stored = getDashboardPreferences(userPreferences.dashboard, userId);
    confirmed.current = stored;
    setSelection({ userId, preferences: stored });
  }, [userPreferences.dashboard, userId]);

  const updatePreferences = useCallback(
    async (patch: DashboardPreferencesPatch) => {
      pending.current.push(patch);
      setSelection({ userId, preferences: pending.current.reduce(patchDashboardPreferences, confirmed.current) });
      try {
        await updateDashboard(patch, () => {
          if (currentAccount.current !== userId) throw new Error('The signed-in account changed');
        });
        if (currentAccount.current === userId) confirmed.current = patchDashboardPreferences(confirmed.current, patch);
      } finally {
        const index = pending.current.indexOf(patch);
        if (index >= 0) pending.current.splice(index, 1);
        if (currentAccount.current === userId) {
          setSelection({ userId, preferences: pending.current.reduce(patchDashboardPreferences, confirmed.current) });
          if (!pending.current.length) await router.invalidate();
        }
      }
    },
    [updateDashboard, router, userId],
  );

  return { preferences: selection.userId === userId ? selection.preferences : initial, updatePreferences };
}
