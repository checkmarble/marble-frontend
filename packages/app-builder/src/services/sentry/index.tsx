import { type CurrentUser } from '@app-builder/models';
import * as Sentry from '@sentry/react';
import { type replayIntegration } from '@sentry/react';
import { useHydrated, useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';

declare global {
  interface Window {
    __sentryReplay?: ReturnType<typeof replayIntegration>;
  }
}

const getSentryReplay = () => (typeof window !== 'undefined' ? window.__sentryReplay : undefined);

export function useSentryIdentification(user: CurrentUser) {
  const isHydrated = useHydrated();
  useEffect(() => {
    if (isHydrated && user.actorIdentity.userId) {
      Sentry.setUser({
        id: user.actorIdentity.userId,
        email: user.actorIdentity.email,
        username: [user.actorIdentity.firstName, user.actorIdentity.lastName].filter(Boolean).join(' ') || undefined,
      });
    }
  }, [
    user.actorIdentity.userId,
    user.actorIdentity.email,
    user.actorIdentity.firstName,
    user.actorIdentity.lastName,
    isHydrated,
  ]);
}

export function useSentryReplay(sentryReplayEnabled: boolean) {
  const isHydrated = useHydrated();
  const location = useLocation();

  useEffect(() => {
    if (isHydrated && sentryReplayEnabled) {
      const replay = getSentryReplay();
      // start() is a no-op if replay is already running, but will restart if session ended
      replay?.start();
      // flushing the replay makes it switch to session mode
      replay?.flush({ continueRecording: true });
    }
  }, [isHydrated, sentryReplayEnabled, location.pathname]);
}
