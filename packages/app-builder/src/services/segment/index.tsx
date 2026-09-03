import { type CurrentUser } from '@app-builder/models';
import { useHydrated, useLocation, useMatches } from '@tanstack/react-router';
import { useEffect } from 'react';

import { getPageViewNameAndProps } from './getPageviewNameAndProps';

export function useSegmentIdentification(user: CurrentUser) {
  const isHydrated = useHydrated();
  useEffect(() => {
    const identify = () => {
      if (isHydrated) {
        void window.analytics?.identify(user.actorIdentity.userId);
        if (user.actorIdentity.userId) {
          void window.analytics?.track('Logged In');
        }
      }
    };

    identify();
    window.addEventListener('segment-consent-granted', identify);
    return () => window.removeEventListener('segment-consent-granted', identify);
  }, [user.actorIdentity.userId, user.organizationId, isHydrated]);
}

export function useSegmentPageTracking() {
  const location = useLocation();
  const isHydrated = useHydrated();
  const matches = useMatches();
  const thisPage = matches[matches.length - 1];
  useEffect(() => {
    const trackPage = () => {
      if (!isHydrated || !thisPage) return;

      const tracking = getPageViewNameAndProps(thisPage);
      if (!tracking) return;
      const { name, properties } = tracking;
      void window.analytics?.page(name, properties);
    };

    trackPage();
    window.addEventListener('segment-consent-granted', trackPage);
    return () => window.removeEventListener('segment-consent-granted', trackPage);
  }, [location.href, thisPage?.id, isHydrated]);
}

export const segment = {
  reset: () => window.analytics?.reset(),
};
