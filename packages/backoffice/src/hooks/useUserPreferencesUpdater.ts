import type { DashboardPreferencesPatch } from '@bo/schemas/dashboard';
import { updateDashboardPreferencesFn, updateUserPreferencesFn } from '@bo/server-fns/core';
import { useServerFn } from '@tanstack/react-start';
import { useMemo } from 'react';

// Theme and dashboard writes rewrite the same cookie. A write must finish before the next
// request reads that cookie, so rapid independent changes cannot overwrite each other.
let pendingPreferenceWrite: Promise<unknown> = Promise.resolve();

function enqueuePreferenceWrite<T>(write: () => Promise<T>): Promise<T> {
  const next = pendingPreferenceWrite.then(write);
  pendingPreferenceWrite = next.catch(() => undefined);
  return next;
}

export function useUserPreferencesUpdater() {
  const callUpdateTheme = useServerFn(updateUserPreferencesFn);
  const callUpdateDashboard = useServerFn(updateDashboardPreferencesFn);

  return useMemo(
    () => ({
      updateTheme: (theme: 'light' | 'dark') => enqueuePreferenceWrite(() => callUpdateTheme({ data: { theme } })),
      // beforeWrite runs when the queue reaches this write and cancels it by throwing.
      updateDashboard: (patch: DashboardPreferencesPatch, beforeWrite?: () => void) =>
        enqueuePreferenceWrite(() => {
          beforeWrite?.();
          return callUpdateDashboard({ data: patch });
        }),
    }),
    [callUpdateTheme, callUpdateDashboard],
  );
}
